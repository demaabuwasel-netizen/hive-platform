import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader, MessageCircle, Search, Send } from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { getMessages, sendInterviewMessage } from '../services/messages'
import { supabase } from '../services/supabase'
import { withTimeout } from '../utils/withTimeout'

function formatTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDisplayName(userId, userNames) {
  return userNames[userId] || 'Conversation'
}

export default function Messages() {
  const { user } = useApp()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [selectedConvId, setSelectedConvId] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [userNames, setUserNames] = useState({})
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        const data = await withTimeout(getMessages(user.id), 10000, 'getMessages')
        if (cancelled) return

        setMessages(data || [])

        const userIds = Array.from(new Set([
          ...(data?.map(msg => msg.sender_id) || []),
          ...(data?.map(msg => msg.recipient_id) || []),
        ]))

        if (userIds.length === 0) return

        const { data: profiles } = await withTimeout(
          supabase
            .from('ngo_profiles')
            .select('user_id, name')
            .in('user_id', userIds),
          10000,
          'fetchNgoProfiles'
        )

        if (cancelled) return

        const nameMap = {}
        profiles?.forEach(profile => {
          if (profile.name) nameMap[profile.user_id] = profile.name
        })

        const missingIds = userIds.filter(id => !nameMap[id])
        if (missingIds.length > 0) {
          const { data: users } = await withTimeout(
            supabase
              .from('users')
              .select('id, name')
              .in('id', missingIds),
            10000,
            'fetchUserNames'
          )

          users?.forEach(nextUser => {
            if (nextUser.name) nameMap[nextUser.id] = nextUser.name
          })
        }

        if (!cancelled) setUserNames(nameMap)
      } catch (err) {
        console.error('Error loading messages:', err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConvId, messages.length])

  async function handleSendMessage() {
    if (!newMessage.trim() || !selected || !user?.id || sending) return

    setSending(true)
    try {
      await sendInterviewMessage(selected.otherId, user.id, newMessage)

      const timestamp = new Date().toISOString()
      const newMsg = {
        id: `temp-${timestamp}`,
        sender_id: user.id,
        recipient_id: selected.otherId,
        message_body: newMessage,
        message_type: 'general',
        created_at: timestamp,
      }
      setMessages(prev => [...prev, newMsg])
      setNewMessage('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const conversations = messages.reduce((acc, msg) => {
    const otherId = msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id
    const key = [user?.id, otherId].sort().join('-')

    if (!acc[key]) {
      acc[key] = {
        id: key,
        otherId,
        lastMessage: msg,
        messages: [],
      }
    }
    acc[key].messages.push(msg)
    acc[key].lastMessage = msg
    return acc
  }, {})

  const conversationList = Object.values(conversations).sort(
    (a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
  )

  const filtered = conversationList.filter(conversation => {
    const query = searchQ.toLowerCase()
    const name = getDisplayName(conversation.otherId, userNames).toLowerCase()
    const body = conversation.lastMessage.message_body?.toLowerCase() || ''
    return name.includes(query) || body.includes(query)
  })

  const selected = conversationList.find(conversation => conversation.id === selectedConvId)
  const selectedMessages = selected
    ? [...selected.messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    : []
  const selectedName = selected ? getDisplayName(selected.otherId, userNames) : ''

  return (
    <main className="flex-1 overflow-y-auto bg-[#F6F8FC]">
      <div className="mx-auto max-w-[1480px] px-6 pb-8 pt-12 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
            Your Messages
          </h1>
          <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#5F6368]">
            Keep interview conversations and NGO updates organized in one clean workspace.
          </p>
        </motion.header>

        <section className="grid gap-6 md:grid-cols-[340px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
            className="flex h-[min(720px,calc(100vh-220px))] min-h-[560px] flex-col overflow-hidden rounded-[32px] border border-[#D7E6FF] bg-white shadow-[0_14px_38px_rgba(17,24,39,0.035)]"
          >
            <div className="shrink-0 border-b border-[#E5EEFB] px-6 py-6">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-[1.05rem] font-semibold text-[#202124]">Conversations</h2>
                  <p className="mt-1 text-[0.84rem] text-[#5F6368]">
                    {loading ? 'Loading...' : `${conversationList.length} total`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-[#E5EEFB] bg-[#F8FBFF] px-3 py-2.5">
                <Search size={15} className="shrink-0 text-[#1A73E8]" />
                <input
                  value={searchQ}
                  onChange={event => setSearchQ(event.target.value)}
                  placeholder="Search conversations..."
                  className="min-w-0 flex-1 bg-transparent text-[0.84rem] text-[#202124] outline-none placeholder:text-[#9AA0A6]"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2, 3].map(item => (
                    <div
                      key={item}
                      className="h-[84px] animate-pulse rounded-[24px] border border-[#E5EEFB] bg-[#F8FBFF]"
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-[26px] border border-dashed border-[#D7E6FF] bg-[#F8FBFF] px-5 text-center">
                  <div>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                      <MessageCircle size={24} />
                    </div>
                    <p className="text-[0.95rem] font-semibold text-[#202124]">No conversations yet</p>
                    <p className="mt-2 text-[0.82rem] leading-6 text-[#5F6368]">
                      Interview invitations and replies will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                filtered.map(conversation => {
                  const otherUserName = getDisplayName(conversation.otherId, userNames)
                  const selectedConversation = selectedConvId === conversation.id

                  return (
                    <motion.button
                      key={conversation.id}
                      onClick={() => setSelectedConvId(conversation.id)}
                      className="mb-3 w-full rounded-[24px] border p-4 text-left transition-all"
                      style={
                        selectedConversation
                          ? {
                              background: '#EAF1FF',
                              borderColor: '#C8D9FF',
                              boxShadow: '0 10px 28px rgba(26,115,232,0.08)',
                            }
                          : {
                              background: '#FFFFFF',
                              borderColor: '#E5EEFB',
                            }
                      }
                    >
                      <div className="flex items-start gap-3">
                        <GradientAvatar name={otherUserName} size={44} radius="0.85rem" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="truncate text-[0.94rem] font-semibold text-[#202124]">
                              {otherUserName}
                            </p>
                            <span className="shrink-0 text-[0.72rem] font-medium text-[#9AA0A6]">
                              {formatTime(conversation.lastMessage.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[0.82rem] leading-6 text-[#5F6368]">
                            {conversation.lastMessage.message_body}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })
              )}
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-[min(720px,calc(100vh-220px))] min-h-[560px] flex-col overflow-hidden rounded-[32px] border border-[#D7E6FF] bg-white shadow-[0_14px_38px_rgba(17,24,39,0.035)]"
          >
            {!selectedConvId ? (
              <div className="flex flex-1 items-center justify-center px-8 py-16 text-center">
                <div>
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F0FE] text-[#1A73E8]">
                    <MessageCircle size={30} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#202124]">Select a conversation</h2>
                  <p className="mx-auto mt-3 max-w-md text-[0.9rem] leading-7 text-[#5F6368]">
                    Choose a conversation from the left to read messages and reply.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="shrink-0 border-b border-[#E5EEFB] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <GradientAvatar name={selectedName} size={44} radius="0.85rem" />
                    <div>
                      <p className="text-[1rem] font-semibold text-[#202124]">{selectedName}</p>
                      <p className="mt-0.5 text-[0.8rem] text-[#5F6368]">
                        {selectedMessages.length} message{selectedMessages.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#FBFCFE] px-6 py-6">
                  {selectedMessages.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-[0.86rem] text-[#5F6368]">No messages in this conversation</p>
                    </div>
                  ) : (
                    selectedMessages.map((msg, index) => {
                      const mine = msg.sender_id === user?.id

                      return (
                        <motion.div
                          key={msg.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[min(72%,560px)] rounded-[22px] px-4 py-3 text-[0.88rem] leading-6 shadow-[0_8px_22px_rgba(17,24,39,0.04)] ${
                              mine
                                ? 'rounded-br-md bg-[#1A73E8] text-white'
                                : 'rounded-bl-md border border-[#E5EEFB] bg-white text-[#202124]'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.message_body}</p>
                            <p className={`mt-2 text-[0.7rem] ${mine ? 'text-white/70' : 'text-[#9AA0A6]'}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="shrink-0 border-t border-[#E5EEFB] bg-white px-6 py-4">
                  <div className="flex gap-3 rounded-[22px] border border-[#E5EEFB] bg-[#F8FBFF] p-2">
                    <input
                      ref={inputRef}
                      value={newMessage}
                      onChange={event => setNewMessage(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Type a message..."
                      disabled={sending}
                      className="min-w-0 flex-1 bg-transparent px-3 text-[0.9rem] text-[#202124] outline-none placeholder:text-[#9AA0A6] disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A73E8] text-white shadow-[0_8px_18px_rgba(26,115,232,0.18)] transition-all hover:bg-[#1558C0] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send message"
                    >
                      {sending ? <Loader size={17} className="animate-spin" /> : <Send size={17} />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.section>
        </section>
      </div>
    </main>
  )
}
