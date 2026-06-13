import { supabase } from './supabase'

export async function sendInterviewMessage(studentId, ngoId, message) {
  if (!studentId || !ngoId || !message) {
    throw new Error('Missing required fields: studentId, ngoId, message')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      recipient_id: studentId,
      sender_id: ngoId,
      message_body: message,
      message_type: 'interview_invitation',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getMessages(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getConversation(userId, otherUserId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(recipient_id.eq.${userId},sender_id.eq.${otherUserId}),and(recipient_id.eq.${otherUserId},sender_id.eq.${userId})`
    )
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}
