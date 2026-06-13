import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, MessageCircle, Loader, AlertCircle, Send } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getMessages, sendInterviewMessage } from '../services/messages'
import { supabase } from '../services/supabase'
import GradientAvatar from '../components/GradientAvatar'

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

export default function Messages() {
  const { user } = useApp()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [selectedConvId, setSelectedConvId] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [userNames, setUserNames] = useState({})
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return

    ;(async () => {
      try {
        setLoading(true)
        const data = await getMessages(user.id)
        setMessages(data || [])

        // Fetch user names for all senders and recipients
        const userIds = new Set()
        data?.forEach(msg => {
          userIds.add(msg.sender_id)
          userIds.add(msg.recipient_id)
        })

        if (userIds.size > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('id, name')
            .in('id', Array.from(userIds))

          const nameMap = {}
          users?.forEach(u => {
            nameMap[u.id] = u.name
          })
          setUserNames(nameMap)
        }
      } catch (err) {
        console.error('Error loading messages:', err)
        setError('Failed to load messages')
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConvId, messages.length])

  async function handleSendMessage() {
    if (!newMessage.trim() || !selected || !user?.id || sending) return

    setSending(true)
    try {
      await sendInterviewMessage(selected.otherId, user.id, newMessage)

      // Add message to local state
      const timestamp = new Date().toISOString()
      const newMsg = {
        id: `temp-${timestamp}`,
        sender_id: user.id,
        recipient_id: selected.otherId,
        message_body: newMessage,
        message_type: 'general',
        created_at: timestamp,
      }
      setMessages([...messages, newMsg])
      setNewMessage('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Group messages by conversation (sender + recipient)
  const conversations = messages.reduce((acc, msg) => {
    const otherId = msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id
    const key = [user?.id, otherId].sort().join('-')

    if (!acc[key]) {
      acc[key] = {
        id: key,
        otherId,
        otherName: msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id,
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

  const filtered = conversationList.filter(c =>
    (c.lastMessage.message_body?.toLowerCase() || '').includes(searchQ.toLowerCase())
  )

  const selected = conversationList.find(c => c.id === selectedConvId)
  const selectedMessages = selected?.messages?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || []

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden" style={{ background: '#F8F9FB' }}>
      {/* Conversation List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-[320px] shrink-0 bg-white flex flex-col border-r border-[rgba(13,24,61,0.08)]"
      >
        <div className="px-6 pt-6 pb-4 border-b border-[rgba(13,24,61,0.08)]">
          <h2 className="text-[16px] font-bold text-[#0D183D] mb-4">Messages</h2>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F8F9FB] border border-[rgba(13,24,61,0.08)]">
            <Search size={14} className="text-[#4B6382] shrink-0" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search conversations…"
              className="bg-transparent text-[12px] flex-1 outline-none text-[#0D183D] placeholder-[#4B6382]/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <Loader size={20} className="text-[#FFB703] mx-auto animate-spin mb-3" />
              <p className="text-[12px] text-[#4B6382]">Loading messages…</p>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <AlertCircle size={20} className="text-red-500 mx-auto mb-3" />
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <MessageCircle size={24} className="text-[#FFB703] mx-auto mb-3" />
              <p className="text-[13px] font-semibold text-[#0D183D] mb-1">No conversations yet</p>
              <p className="text-[11px] text-[#4B6382] leading-relaxed">
                Interview invitations will appear here
              </p>
            </div>
          ) : (
            filtered.map((conv) => {
              const otherUserName = userNames[conv.otherId] || 'User'
              return (
                <motion.button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-[rgba(13,24,61,0.04)] transition-all hover:bg-[#F8F9FB] ${
                    selectedConvId === conv.id ? 'bg-[#FFF9F0] border-l-4 border-l-[#FFB703]' : ''
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <GradientAvatar name={otherUserName} size={40} radius="0.6rem" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#0D183D] truncate">
                        {otherUserName}
                      </p>
                      <p className="text-[11px] text-[#4B6382] truncate line-clamp-1">
                        {conv.lastMessage.message_body}
                      </p>
                      <p className="text-[10px] text-[#4B6382]/60 mt-1">
                        {formatTime(conv.lastMessage.created_at)}
                      </p>
                    </div>
                  </div>
                </motion.button>
              )
            })
          )}
        </div>
      </motion.div>

      {/* Message Thread */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col bg-white"
      >
        {!selectedConvId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="text-[#FFB703]/30 mx-auto mb-4" />
              <p className="text-[14px] font-semibold text-[#0D183D] mb-2">
                Select a conversation
              </p>
              <p className="text-[12px] text-[#4B6382]">
                Choose a conversation to view messages
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Message Thread Header */}
            <div className="px-6 py-4 border-b border-[rgba(13,24,61,0.08)] flex items-center gap-3">
              <GradientAvatar name={userNames[selected?.otherId] || 'User'} size={36} radius="0.5rem" />
              <div>
                <p className="text-[13px] font-semibold text-[#0D183D]">{userNames[selected?.otherId] || 'User'}</p>
                <p className="text-[11px] text-[#4B6382]">
                  {selectedMessages.length} message{selectedMessages.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {selectedMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[12px] text-[#4B6382]">No messages in this conversation</p>
                </div>
              ) : (
                selectedMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl text-[12px] leading-relaxed ${
                        msg.sender_id === user?.id
                          ? 'bg-[#0D183D] text-white'
                          : 'bg-[#F0F0F0] text-[#0D183D]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message_body}</p>
                      <p
                        className={`text-[10px] mt-2 ${
                          msg.sender_id === user?.id ? 'text-white/70' : 'text-[#4B6382]/60'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-[rgba(13,24,61,0.08)] flex gap-2">
              <input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message…"
                disabled={sending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(13,24,61,0.1)] text-[12px] text-[#0D183D] placeholder-[#4B6382]/50 focus:outline-none focus:border-[#FFB703] disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2.5 rounded-xl bg-[#FFB703] text-white font-semibold text-[12px] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
