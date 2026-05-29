import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import API from '../../api/axios'
import toast from 'react-hot-toast'

export default function Analytics() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [proposals, setProposals] = useState([])
  const [payments, setPayments]   = useState([])
  const [reviews, setReviews]     = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [proposalRes, paymentRes, reviewRes] = await Promise.all([
        API.get('/proposals/my'),
        API.get('/payments/my'),
        API.get(`/reviews/user/${user._id}`)
      ])
      setProposals(proposalRes.data.proposals)
      setPayments(paymentRes.data.payments)
      setReviews(reviewRes.data.reviews)
    } catch (err) {
      toast.error('Data load nahi hua!')
    } finally {
      setLoading(false)
    }
  }

  // Stats calculate karo
  const totalEarned = payments
    .filter(p => p.status === 'released' && p.freelancer?._id === user._id)
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingAmount = payments
    .filter(p => p.status === 'in-escrow' && p.freelancer?._id === user._id)
    .reduce((sum, p) => sum + p.amount, 0)

  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length
  const pendingProposals  = proposals.filter(p => p.status === 'pending').length
  const rejectedProposals = proposals.filter(p => p.status === 'rejected').length

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const successRate = proposals.length > 0
    ? Math.round((acceptedProposals / proposals.length) * 100)
    : 0

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
        <button onClick={() => navigate('/dashboard')}
          className="text-gray-500 hover:text-gray-700 text-sm">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 My Analytics</h2>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-gray-500 text-sm">Total Earned</p>
            <h3 className="text-2xl font-bold text-green-600 mt-1">₹{totalEarned}</h3>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-gray-500 text-sm">Pending</p>
            <h3 className="text-2xl font-bold text-yellow-600 mt-1">₹{pendingAmount}</h3>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-gray-500 text-sm">Avg Rating</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">⭐ {avgRating}</h3>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-gray-500 text-sm">Success Rate</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{successRate}%</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Proposal Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">📝 Proposal Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Proposals</span>
                <span className="font-bold text-gray-800">{proposals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Accepted</span>
                <span className="font-bold text-green-600">{acceptedProposals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Pending</span>
                <span className="font-bold text-yellow-600">{pendingProposals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Rejected</span>
                <span className="font-bold text-red-600">{rejectedProposals}</span>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Success Rate</span>
                  <span>{successRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Review Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">⭐ Review Stats</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(star => {
                const count   = reviews.filter(r => r.rating === star).length
                const percent = reviews.length > 0
                  ? Math.round((count / reviews.length) * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-8">{star}⭐</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8">{count}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-3xl font-bold text-yellow-500">{avgRating}</p>
              <p className="text-gray-400 text-sm">{reviews.length} reviews</p>
            </div>
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">📋 Recent Proposals</h3>
          {proposals.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Koi proposal nahi!</p>
          ) : (
            <div className="space-y-3">
              {proposals.slice(0, 5).map(proposal => (
                <div key={proposal._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {proposal.gig?.title || 'Gig'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Bid: ₹{proposal.bidAmount} • {proposal.deliveryTime} days
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    proposal.status === 'accepted' ? 'bg-green-100 text-green-600' :
                    proposal.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                     'bg-yellow-100 text-yellow-600'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">💬 Recent Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Koi review nahi abhi!</p>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 3).map(review => (
                <div key={review._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-800 text-sm">
                      {review.reviewer?.name}
                    </p>
                    <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}