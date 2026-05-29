import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Disputes() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [disputes, setDisputes]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [myPayments, setMyPayments] = useState([])
  const [formData, setFormData]   = useState({
    gigId: '', paymentId: '', againstId: '', reason: '', description: ''
  })

  useEffect(() => {
    fetchDisputes()
    fetchMyPayments()
  }, [])

  const fetchDisputes = async () => {
    try {
      const url = user?.role === 'admin' ? '/disputes' : '/disputes/my'
      const res = await API.get(url)
      setDisputes(res.data.disputes)
    } catch (err) {
      toast.error('Disputes load nahi hue!')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyPayments = async () => {
    try {
      const res = await API.get('/payments/my')
      setMyPayments(res.data.payments.filter(p => p.status === 'in-escrow'))
    } catch (err) {
      console.log(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/disputes', formData)
      toast.success('Dispute raise ho gaya!')
      setShowForm(false)
      fetchDisputes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error aaya!')
    }
  }

  const handleResolve = async (disputeId, status) => {
    const resolution = prompt('Resolution likhو:')
    if (!resolution) return
    try {
      await API.put(`/disputes/${disputeId}/resolve`, { status, resolution })
      toast.success('Dispute resolve ho gaya!')
      fetchDisputes()
    } catch (err) {
      toast.error('Error aaya!')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'open':                return 'bg-red-100 text-red-600'
      case 'under_review':        return 'bg-yellow-100 text-yellow-600'
      case 'resolved_client':     return 'bg-blue-100 text-blue-600'
      case 'resolved_freelancer': return 'bg-green-100 text-green-600'
      case 'closed':              return 'bg-gray-100 text-gray-600'
      default:                    return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading... ⏳</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 onClick={() => navigate('/dashboard')}
          className="text-2xl font-bold text-indigo-600 cursor-pointer">
          SkillSphere
        </h1>
        <div className="flex items-center gap-4">
          {user?.role !== 'admin' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
            >
              + Raise Dispute
            </button>
          )}
          <button onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm">
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">⚖️ Disputes</h2>

        {/* Raise Dispute Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Dispute Raise Karo</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Select Karo
                </label>
                <select
                  required
                  value={formData.paymentId}
                  onChange={(e) => {
                    const payment = myPayments.find(p => p._id === e.target.value)
                    setFormData({
                      ...formData,
                      paymentId:  e.target.value,
                      gigId:      payment?.gig?._id || '',
                      againstId:  user?.role === 'client'
                        ? payment?.freelancer?._id
                        : payment?.client?._id
                    })
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select payment...</option>
                  {myPayments.map(payment => (
                    <option key={payment._id} value={payment._id}>
                      {payment.gig?.title} — ₹{payment.amount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text" required
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Kaam nahi kiya / Payment nahi mili..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detail mein batao kya hua..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit"
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition">
                  Raise Dispute ⚖️
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Disputes List */}
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <p className="text-4xl mb-3">⚖️</p>
              <p className="text-gray-400">Koi dispute nahi! Sab theek hai 😊</p>
            </div>
          ) : (
            disputes.map(dispute => (
              <div key={dispute._id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {dispute.gig?.title || 'Gig'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Raised by: {dispute.raisedBy?.name} →
                      Against: {dispute.against?.name}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(dispute.status)}`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Reason: {dispute.reason}
                  </p>
                  <p className="text-sm text-gray-600">{dispute.description}</p>
                </div>

                {dispute.resolution && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-green-700 mb-1">Resolution:</p>
                    <p className="text-sm text-green-600">{dispute.resolution}</p>
                  </div>
                )}

                {/* Admin Actions */}
                {user?.role === 'admin' && dispute.status === 'open' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleResolve(dispute._id, 'resolved_client')}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-200 transition"
                    >
                      Client Ke Favour Mein
                    </button>
                    <button
                      onClick={() => handleResolve(dispute._id, 'resolved_freelancer')}
                      className="bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm hover:bg-green-200 transition"
                    >
                      Freelancer Ke Favour Mein
                    </button>
                    <button
                      onClick={() => handleResolve(dispute._id, 'closed')}
                      className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
                    >
                      Close Karo
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}