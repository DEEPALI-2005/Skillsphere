import { useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../api/axios'
import toast from 'react-hot-toast'

export default function VerifyBanner() {
  const { user }  = useSelector((state) => state.auth)
  const [sent, setSent] = useState(false)

  if (!user || user.isVerified) return null

  const handleResend = async () => {
    try {
      await API.post('/auth/resend-verification')
      setSent(true)
      toast.success('Verification email bhej diya!')
    } catch (err) {
      toast.error('Email send nahi hua!')
    }
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span>⚠️</span>
        <p className="text-yellow-800 text-sm">
          Tumhara email verify nahi hua! Inbox check karo.
        </p>
      </div>
      {!sent ? (
        <button
          onClick={handleResend}
          className="text-yellow-700 text-sm font-medium hover:underline"
        >
          Dobara Bhejo →
        </button>
      ) : (
        <span className="text-green-600 text-sm">✅ Email bhej diya!</span>
      )}
    </div>
  )
}