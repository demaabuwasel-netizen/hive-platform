export async function askHiveAI({ prompt, messages, model, maxOutputTokens } = {}) {
  const body = {
    ...(prompt ? { prompt } : {}),
    ...(messages ? { messages } : {}),
    ...(model ? { model } : {}),
    ...(maxOutputTokens ? { max_output_tokens: maxOutputTokens } : {}),
  }

  const response = await fetch('/api/openai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data?.error) {
    throw new Error(data?.error || 'AI request failed')
  }

  return data
}

export async function createHiveSpeech({ input } = {}) {
  const response = await fetch('/api/openai-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.error || 'AI speech request failed')
  }

  return response.blob()
}
