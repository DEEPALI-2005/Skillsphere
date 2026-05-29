import { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../api/axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Email bhej diya!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kuch galat hua!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">SkillSphere</h1>
          <p className="text-gray-500 mt-1">Password Reset</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Email Bhej Diya!</h2>
            <p className="text-gray-500 mb-6">
              {email} pe password reset link bheja gaya hai!
            </p>
            <Link to="/login" className="text-indigo-600 hover:underline">
              ← Login pe wapas jao
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tumhari@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Bhej raha hai...' : 'Reset Link Bhejo 📧'}
            </button>

            <p className="text-center text-gray-500">
              <Link to="/login" className="text-indigo-600 hover:underline">
                ← Login pe wapas jao
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}