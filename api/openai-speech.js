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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
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

  const input = typeof body.input === 'string'
    ? body.input.trim().slice(0, 1200)
    : ''

  if (!input) {
    res.status(400).json({ error: 'Send input text' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    if (process.env.VITE_OPENAI_API_KEY) {
      res.status(500).json({ error: 'Use OPENAI_API_KEY on the server, not VITE_OPENAI_API_KEY' })
      return
    }

    res.status(500).json({ error: 'AI speech is not configured' })
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
      const data = await openaiResponse.json().catch(() => ({}))
      console.error('OpenAI speech request failed', {
        status: openaiResponse.status,
        type: data?.error?.type,
        code: data?.error?.code,
        message: data?.error?.message,
      })
      res.status(openaiResponse.status).json({ error: `AI speech failed (${openaiResponse.status})` })
      return
    }

    const audioBuffer = Buffer.from(await openaiResponse.arrayBuffer())
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(audioBuffer)
  } catch (error) {
    console.error('OpenAI speech route unavailable', {
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    res.status(502).json({ error: 'AI speech unavailable' })
  }
}
