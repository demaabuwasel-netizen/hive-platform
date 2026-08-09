export const config = {
  api: {
    bodyParser: {
      sizeLimit: '64kb',
    },
  },
  maxDuration: 30,
}

function parseBody(body) {
  if (!body) return {}
  if (typeof body !== 'string') return body

  try {
    return JSON.parse(body)
  } catch {
    return null
  }
}

function normalizeMessages(body = {}) {
  if (typeof body.prompt === 'string' && body.prompt.trim()) {
    return [{ role: 'user', content: body.prompt.trim() }]
  }

  if (!Array.isArray(body.messages)) return null

  const messages = body.messages
    .map(message => {
      if (!message || typeof message !== 'object') return null
      const { role, content } = message
      if (!['system', 'user', 'assistant', 'developer'].includes(role)) return null
      if (typeof content !== 'string' || !content.trim()) return null
      return { role, content: content.trim() }
    })
    .filter(Boolean)

  return messages.length ? messages : null
}

function extractOutputText(response = {}) {
  if (typeof response.output_text === 'string') return response.output_text

  const output = Array.isArray(response.output) ? response.output : []
  return output
    .flatMap(item => Array.isArray(item?.content) ? item.content : [])
    .map(part => typeof part?.text === 'string' ? part.text : '')
    .filter(Boolean)
    .join('\n')
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      route: 'openai-chat',
      hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
      hasViteOpenAIKey: Boolean(process.env.VITE_OPENAI_API_KEY),
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = parseBody(req.body)
  if (!body) {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  const input = normalizeMessages(body)
  if (!input) {
    res.status(400).json({ error: 'Send a prompt or messages array' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    if (process.env.VITE_OPENAI_API_KEY) {
      res.status(500).json({ error: 'Use OPENAI_API_KEY on the server, not VITE_OPENAI_API_KEY' })
      return
    }

    res.status(500).json({ error: 'AI service is not configured' })
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
      console.error('OpenAI chat request failed', {
        status: openaiResponse.status,
        type: data?.error?.type,
        code: data?.error?.code,
        message: data?.error?.message,
      })
      res.status(openaiResponse.status).json({ error: `AI request failed (${openaiResponse.status})` })
      return
    }

    res.status(200).json({
      text: extractOutputText(data),
      id: data.id ?? null,
      model: data.model ?? model,
    })
  } catch (error) {
    console.error('OpenAI chat route unavailable', {
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    res.status(502).json({ error: 'AI service unavailable' })
  }
}
