export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const input = typeof req.body?.input === 'string'
    ? req.body.input.trim().slice(0, 1200)
    : ''

  if (!input) {
    res.status(400).json({ error: 'Send input text' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
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
      res.status(openaiResponse.status).json({ error: `AI speech failed (${openaiResponse.status})` })
      return
    }

    const audioBuffer = Buffer.from(await openaiResponse.arrayBuffer())
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(audioBuffer)
  } catch {
    res.status(502).json({ error: 'AI speech unavailable' })
  }
}
