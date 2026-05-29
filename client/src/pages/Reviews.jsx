import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Reviews() {
  const { userId }  = useParams()
  const navigate    = useNavigate()
  const { user }    = useSelector((state) => state.auth)
  const [reviews, setReviews]       = useState([])
  const [targetUser, setTargetUser] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [myGigs, setMyGigs]         = useState([])
  const [formData, setFormData]     = useState({
    gigId: '', rating: 5, comment: ''
  })

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const [userRes, reviewRes] = await Promise.all([
        API.get(`/users/${userId}`),
        API.get(`/reviews/user/${userId}`)
      ])
      setTargetUser(userRes.data.user)
      setReviews(reviewRes.data.reviews)

      // Client ke gigs fetch karo
      if (user?.role === 'client') {
        const gigRes = await API.get('/gigs/my')
        setMyGigs(gigRes.data.gigs)
      }
    } catch (err) {
      toast.error('Data load nahi hua!')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/reviews', {
        gigId:      formData.gigId,
        revieweeId: userId,
        rating:     Number(formData.rating),
        comment:    formData.comment
      })
      toast.success('Review de diya! ⭐')
      setShowForm(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review nahi de saka!')
    }
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading... ⏳</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
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

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* User Info */}
        {targetUser && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
              {targetUser.avatar
                ? <img src={targetUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                : targetUser.name?.charAt(0)
              }
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{targetUser.name}</h2>
              <p className="text-gray-500 text-sm">{targetUser.role} • {targetUser.location || 'Location nahi'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-500">
                  {renderStars(targetUser.rating || 0)}
                </span>
                <span className="text-gray-600 font-medium">
                  {targetUser.rating || '0'} ({reviews.length} reviews)
                </span>
              </div>
            </div>
            {user?.role === 'client' && user._id !== userId && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                + Review Do
              </button>
            )}
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Review Do ⭐</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gig Select Karo
                </label>
                <select
                  required
                  value={formData.gigId}
                  onChange={(e) => setFormData({...formData, gigId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select gig...</option>
                  {myGigs.map(gig => (
                    <option key={gig._id} value={gig._id}>{gig.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className={`text-3xl transition ${
                        star <= formData.rating ? 'opacity-100' : 'opacity-30'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="text-gray-600 ml-2 self-center font-medium">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment
                </label>
                <textarea
                  required rows={3}
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  placeholder="Freelancer ke baare mein batao..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Submit Review ⭐
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg">
            All Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <p className="text-gray-400">Abhi koi review nahi! 📝</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {review.reviewer?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{review.reviewer?.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-yellow-500 text-lg">
                    {renderStars(review.rating)}
                  </span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}