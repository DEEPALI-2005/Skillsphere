import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import socket from '../socket/socket'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Chat() {
  const { userId } = useParams()
  const navigate   = useNavigate()
  const { user }   = useSelector((state) => state.auth)
  const [messages, setMessages]     = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUser, setOtherUser]   = useState(null)
  const [typing, setTyping]         = useState(false)
  const [loading, setLoading]       = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!user?._id) return
  
    // Socket connect
    socket.connect()
    socket.emit('user_online', user._id)
  
    // Data fetch karo
    const fetchData = async () => {
      try {
        const userRes = await API.get(`/users/${userId}`)
        setOtherUser(userRes.data.user)
        const msgRes = await API.get(`/messages/${userId}`)
        setMessages(msgRes.data.messages || [])
        socket.emit('mark_read', {
          senderId: userId,
          receiverId: user._id
        })
      } catch (err) {
        console.log('Error:', err)
        toast.error('Chat load nahi hua!')
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  
    // Socket events
    const onReceive  = (msg) => setMessages(prev => [...prev, msg])
    const onSent     = (msg) => setMessages(prev => [...prev, msg])
    const onTyping   = () => setTyping(true)
    const onNoTyping = () => setTyping(false)
  
    socket.on('receive_message', onReceive)
    socket.on('message_sent',    onSent)
    socket.on('user_typing',     onTyping)
    socket.on('user_stop_typing',onNoTyping)
  
    // Cleanup
    return () => {
      socket.off('receive_message', onReceive)
      socket.off('message_sent',    onSent)
      socket.off('user_typing',     onTyping)
      socket.off('user_stop_typing',onNoTyping)
      socket.disconnect()
    }
  }, [userId, user?._id])

  useEffect(() => { scrollToBottom() }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    socket.emit('send_message', {
      senderId:   user._id,
      receiverId: userId,
      content:    newMessage
    })

    socket.emit('stop_typing', {
      senderId:   user._id,
      receiverId: userId
    })
    setNewMessage('')
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    socket.emit('typing', { senderId: user._id, receiverId: userId })
    setTimeout(() => {
      socket.emit('stop_typing', { senderId: user._id, receiverId: userId })
    }, 1000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-lg">Loading chat... ⏳</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 onClick={() => navigate('/dashboard')}
          className="text-2xl font-bold text-indigo-600 cursor-pointer">
          SkillSphere
        </h1>
        <button onClick={() => navigate(-1)}
          className="text-indigo-600 hover:underline text-sm">
          ← Back
        </button>
      </nav>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col flex-1">

        {/* Other User Header */}
        {otherUser && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
              {otherUser.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{otherUser.name}</p>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="bg-white rounded-xl shadow-sm p-4 overflow-y-auto mb-4 min-h-96 max-h-96">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-center">
                Abhi koi message nahi — pehla message bhejo! 👋
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const senderId = msg.sender?._id || msg.sender
                const isMe = senderId?.toString() === user._id?.toString()
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl text-sm text-gray-500">
                    typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Message likho..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
          >
            Send 📨
          </button>
        </form>
      </div>
    </div>
  )
}