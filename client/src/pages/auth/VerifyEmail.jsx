import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate  = useNavigate()
  const [status, setStatus] = useState('loading') // loading, success, error

  useEffect(() => {
    const verify = async () => {
      try {
        await API.get(`/auth/verify-email/${token}`)
        setStatus('success')
        setTimeout(() => navigate('/login'), 3000)
      } catch (err) {
        setStatus('error')
      }
    }
    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">

        <h1 className="text-3xl font-bold text-indigo-600 mb-8">SkillSphere</h1>

        {status === 'loading' && (
          <div>
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verify ho raha hai...</h2>
            <p className="text-gray-500">Thoda wait karo!</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Email Verify Ho Gaya!
            </h2>
            <p className="text-gray-500 mb-6">
              3 second mein login page pe redirect ho jaoge!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Login Karo →
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Verification Failed!
            </h2>
            <p className="text-gray-500 mb-6">
              Token invalid ya expire ho gaya! Dobara try karo.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Login Pe Jao →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}