import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getMe } from '../store/authSlice'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function TwoFactor() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [step, setStep]         = useState('menu') // menu, setup, disable
  const [qrCode, setQrCode]     = useState('')
  const [secret, setSecret]     = useState('')
  const [token, setToken]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    try {
      const res = await API.post('/2fa/setup')
      setQrCode(res.data.qrCode)
      setSecret(res.data.secret)
      setStep('setup')
      toast.success('QR Code ready hai!')
    } catch (err) {
      toast.error('Setup nahi hua!')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/2fa/verify', { token })
      toast.success('2FA enable ho gaya! 🔐')
      dispatch(getMe())
      setStep('menu')
      setToken('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code galat hai!')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/2fa/disable', { token })
      toast.success('2FA disable ho gaya!')
      dispatch(getMe())
      setStep('menu')
      setToken('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code galat hai!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 onClick={() => navigate('/dashboard')}
          className="text-2xl font-bold text-indigo-600 cursor-pointer">
          SkillSphere
        </h1>
        <button onClick={() => navigate('/dashboard')}
          className="text-gray-500 hover:text-gray-700 text-sm">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🔐 Two-Factor Authentication</h2>

        {/* Menu */}
        {step === 'menu' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">

            {/* Status */}
            <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
              user?.twoFactorEnabled
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <span className="text-2xl">
                {user?.twoFactorEnabled ? '✅' : '⚠️'}
              </span>
              <div>
                <p className={`font-semibold ${
                  user?.twoFactorEnabled ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  2FA {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className={`text-sm ${
                  user?.twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {user?.twoFactorEnabled
                    ? 'Tumhara account extra secure hai!'
                    : '2FA enable karo — account zyada secure hoga!'}
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-gray-800">2FA Kya Hai?</h3>
              <p className="text-gray-500 text-sm">
                Two-Factor Authentication ek extra security layer hai. Login ke time password ke
                saath ek OTP bhi dena hoga jo sirf tumhare phone pe hoga!
              </p>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm font-medium text-indigo-700 mb-2">Kaise kaam karta hai:</p>
                <div className="space-y-1 text-sm text-indigo-600">
                  <p>1️⃣ Google Authenticator app download karo</p>
                  <p>2️⃣ QR Code scan karo</p>
                  <p>3️⃣ App se 6-digit code use karo login ke time</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!user?.twoFactorEnabled ? (
              <button
                onClick={handleSetup}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Setup ho raha hai...' : '🔐 2FA Enable Karo'}
              </button>
            ) : (
              <button
                onClick={() => setStep('disable')}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                2FA Disable Karo
              </button>
            )}
          </div>
        )}

        {/* Setup Step */}
        {step === 'setup' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">QR Code Scan Karo</h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-3">
                <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <p className="text-gray-600 text-sm pt-1">
                  Google Authenticator ya Authy app download karo
                </p>
              </div>

              {/* Step 2 — QR Code */}
              <div className="flex gap-3">
                <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <div>
                  <p className="text-gray-600 text-sm mb-3">Yeh QR Code scan karo:</p>
                  {qrCode && (
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                    />
                  )}
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">
                      QR scan nahi ho raha? Manual key use karo
                    </summary>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                      {secret}
                    </p>
                  </details>
                </div>
              </div>

              {/* Step 3 — Verify */}
              <div className="flex gap-3">
                <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <div className="flex-1">
                  <p className="text-gray-600 text-sm mb-3">
                    App mein jo 6-digit code dikh raha hai woh daalo:
                  </p>
                  <form onSubmit={handleVerify} className="space-y-3">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl font-mono tracking-widest"
                    />
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading || token.length !== 6}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
                      >
                        {loading ? 'Verify ho raha...' : '✅ Verify Karo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setStep('menu'); setToken('') }}
                        className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disable Step */}
        {step === 'disable' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">2FA Disable Karo</h3>
            <p className="text-gray-500 text-sm mb-6">
              Confirm karne ke liye Google Authenticator ka code daalo:
            </p>
            <form onSubmit={handleDisable} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-2xl font-mono tracking-widest"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || token.length !== 6}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? 'Disable ho raha...' : 'Disable Karo'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('menu'); setToken('') }}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}