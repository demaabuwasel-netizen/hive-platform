import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createReadStream, existsSync, readFileSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const port = Number(process.env.PORT || 8787)
const distDir = resolve(__dirname, 'dist')

async function loadServerEnv() {
  for (const filename of ['.env', '.env.local']) {
    const filePath = resolve(__dirname, filename)
    if (!existsSync(filePath)) continue

    const contents = readFileSync(filePath, 'utf8')
    contents.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return

      const separator = trimmed.indexOf('=')
      if (separator === -1) return

      const key = trimmed.slice(0, separator).trim()
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!key || key in process.env) return

      process.env[key] = value
    })
  }
}

loadServerEnv()

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    ...corsHeaders,
    'Content-Type': 'application/json',
  })
  res.end(JSON.stringify(body))
}

function readJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let raw = ''

    req.on('data', chunk => {
      raw += chunk
      if (raw.length > 64_000) {
        rejectBody(new Error('Body too large'))
        req.destroy()
      }
    })

    req.on('end', () => {
      try {
        resolveBody(raw ? JSON.parse(raw) : {})
      } catch {
        rejectBody(new Error('Invalid JSON body'))
      }
    })

    req.on('error', rejectBody)
  })
}

function normalizeMessages(body) {
  if (typeof body.prompt === 'string' && body.prompt.trim()) {
    return [{ role: 'user', content: body.prompt.trim() }]
  }

  if (!Array.isArray(body.messages)) return null

  const messages = body.messages
    .map(message => {
      if (!message || typeof message !== 'object') return null
      const role = message.role
      const content = message.content
      if (!['system', 'user', 'assistant', 'developer'].includes(role)) return null
      if (typeof content !== 'string' || !content.trim()) return null
      return { role, content: content.trim() }
    })
    .filter(Boolean)

  return messages.length ? messages : null
}

function extractOutputText(response) {
  if (typeof response.output_text === 'string') return response.output_text

  const output = Array.isArray(response.output) ? response.output : []
  return output
    .flatMap(item => Array.isArray(item?.content) ? item.content : [])
    .map(part => typeof part?.text === 'string' ? part.text : '')
    .filter(Boolean)
    .join('\n')
}

async function handleOpenAI(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    sendJson(res, error.message === 'Body too large' ? 413 : 400, { error: error.message })
    return
  }

  const input = normalizeMessages(body)
  if (!input) {
    sendJson(res, 400, { error: 'Send a prompt or messages array' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    if (process.env.VITE_OPENAI_API_KEY) {
      sendJson(res, 500, { error: 'Use OPENAI_API_KEY on the server, not VITE_OPENAI_API_KEY' })
      return
    }

    sendJson(res, 500, { error: 'AI service is not configured' })
    return
  }

  const model = typeof body.model === 'string' && body.model.trim()
    ? body.model.trim()
    : process.env.OPENAI_MODEL || 'gpt-4.1-mini'

  const maxOutputTokens = Number.isFinite(Number(body.max_output_tokens))
    ? Math.min(Math.max(Number(body.max_output_tokens), 1), 2000)
    : 700

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input,
        max_output_tokens: maxOutputTokens,
      }),
    })

    const data = await openaiResponse.json().catch(() => ({}))

    if (!openaiResponse.ok) {
      sendJson(res, openaiResponse.status, { error: `AI request failed (${openaiResponse.status})` })
      return
    }

    sendJson(res, 200, {
      text: extractOutputText(data),
      id: data.id ?? null,
      model: data.model ?? model,
    })
  } catch {
    sendJson(res, 502, { error: 'AI service unavailable' })
  }
}

async function handleOpenAISpeech(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    sendJson(res, error.message === 'Body too large' ? 413 : 400, { error: error.message })
    return
  }

  const input = typeof body.input === 'string'
    ? body.input.trim().slice(0, 1200)
    : ''

  if (!input) {
    sendJson(res, 400, { error: 'Send input text' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    sendJson(res, 500, { error: 'AI speech is not configured' })
    return
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
        voice: process.env.OPENAI_TTS_VOICE || 'nova',
        input,
        response_format: 'mp3',
        speed: Number(process.env.OPENAI_TTS_SPEED || 1.02),
        instructions: 'Warm, smooth, natural young woman interviewer voice. Read clearly and conversationally, with light natural pauses and no dramatic performance.',
      }),
    })

    if (!openaiResponse.ok) {
      sendJson(res, openaiResponse.status, { error: `AI speech failed (${openaiResponse.status})` })
      return
    }

    const audioBuffer = Buffer.from(await openaiResponse.arrayBuffer())
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    })
    res.end(audioBuffer)
  } catch {
    sendJson(res, 502, { error: 'AI speech unavailable' })
  }
}

function contentType(filePath) {
  const types = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  }

  return types[extname(filePath)] || 'application/octet-stream'
}

async function serveStatic(req, res) {
  if (!existsSync(distDir)) {
    sendJson(res, 404, { error: 'Build the frontend before using this server in production' })
    return
  }

  const url = new URL(req.url || '/', 'http://localhost')
  const requestedPath = normalize(url.pathname).replace(/^(\.\.[/\\])+/, '')
  const filePath = requestedPath === '/'
    ? join(distDir, 'index.html')
    : join(distDir, requestedPath)
  const resolvedPath = resolve(filePath)

  if (!resolvedPath.startsWith(distDir)) {
    sendJson(res, 403, { error: 'Forbidden' })
    return
  }

  const finalPath = existsSync(resolvedPath) ? resolvedPath : join(distDir, 'index.html')

  try {
    await readFile(finalPath)
    res.writeHead(200, { 'Content-Type': contentType(finalPath) })
    createReadStream(finalPath).pipe(res)
  } catch {
    sendJson(res, 404, { error: 'Not found' })
  }
}

createServer((req, res) => {
  if (req.url?.startsWith('/api/openai-speech')) {
    handleOpenAISpeech(req, res)
    return
  }

  if (req.url?.startsWith('/api/openai-chat')) {
    handleOpenAI(req, res)
    return
  }

  serveStatic(req, res)
}).listen(port)
