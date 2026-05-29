import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getMe } from '../store/authSlice'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Profile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading]   = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '', bio: '', location: '', skills: '', hourlyRate: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name:       user.name       || '',
        bio:        user.bio        || '',
        location:   user.location   || '',
        skills:     user.skills?.join(', ') || '',
        hourlyRate: user.hourlyRate || ''
      })
    }
  }, [user])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    const data = new FormData()
    data.append('avatar', avatarFile)
    try {
      await API.post('/upload/avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Avatar upload ho gaya! 🎉')
      dispatch(getMe())
    } catch (err) {
      toast.error('Avatar upload nahi hua!')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.put('/users/profile', {
        name:       formData.name,
        bio:        formData.bio,
        location:   formData.location,
        skills:     formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        hourlyRate: Number(formData.hourlyRate) || undefined
      })
      toast.success('Profile update ho gaya! ✅')
      dispatch(getMe())
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error aaya!')
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

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 Edit Profile</h2>

        {/* Avatar Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Profile Photo</h3>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
              {avatarPreview || user?.avatar ? (
                <img
                  src={avatarPreview || user?.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-indigo-600">
                  {user?.name?.charAt(0)}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label className="block">
                <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-indigo-100 transition">
                  📷 Photo Select Karo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              {avatarFile && (
                <button
                  onClick={handleAvatarUpload}
                  className="block bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition"
                >
                  ✅ Upload Karo
                </button>
              )}
              <p className="text-xs text-gray-400">JPG, PNG — max 5MB</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Profile Details</h3>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Apne baare mein batao..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Delhi, Mumbai, Remote..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {user?.role === 'freelancer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    placeholder="React, Node.js, MongoDB..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    placeholder="500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Update ho raha hai...' : 'Profile Update Karo ✅'}
            </button>
          </form>
        </div>
        {/* Resume Upload — Freelancer only */}
        {user?.role === 'freelancer' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">📄 Resume Upload</h3>
            <div className="space-y-3">
            {user?.resume && (
  <a
    href={user.resume}
    target="_blank"
    rel="noreferrer"
    className="block text-indigo-600 hover:underline text-sm"
  >
    📄 Current Resume dekho →
  </a>
)}
              <label className="block">
                <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-indigo-100 transition">
                  📎 Resume Select Karo (PDF)
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    const data = new FormData()
                    data.append('resume', file)
                    try {
                      await API.post('/upload/resume', data, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      })
                      toast.success('Resume upload ho gaya!')
                      dispatch(getMe())
                    } catch (err) {
                      toast.error('Resume upload nahi hua!')
                    }
                  }}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400">PDF, DOC, DOCX — max 5MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}