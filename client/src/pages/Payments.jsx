import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Payments() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [payments, setPayments]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [myGigs, setMyGigs]       = useState([])
  const [formData, setFormData]   = useState({
    gigId: '', freelancerId: '', amount: ''
  })

  useEffect(() => {
    fetchPayments()
    if (user?.role === 'client') fetchMyGigs()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await API.get('/payments/my')
      setPayments(res.data.payments)
    } catch (err) {
      toast.error('Payments load nahi hue!')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyGigs = async () => {
    try {
      const res = await API.get('/gigs/my')
      setMyGigs(res.data.gigs.filter(g => g.status === 'in-progress'))
    } catch (err) {
      console.log(err)
    }
  }

  const handleCreatePayment = async (e) => {
    e.preventDefault()
    try {
      await API.post('/payments/create', {
        gigId:        formData.gigId,
        freelancerId: formData.freelancerId,
        amount:       Number(formData.amount)
      })
      toast.success('Payment escrow mein daal diya! 🔒')
      setShowForm(false)
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kuch galat hua!')
    }
  }

  const handleRelease = async (paymentId) => {
    try {
      await API.put(`/payments/${paymentId}/release`)
      toast.success('Payment release ho gaya! 🎉')
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error aaya!')
    }
  }

  const handleRefund = async (paymentId) => {
    try {
      await API.put(`/payments/${paymentId}/refund`)
      toast.success('Refund ho gaya!')
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error aaya!')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'in-escrow':  return 'bg-yellow-100 text-yellow-600'
      case 'released':   return 'bg-green-100 text-green-600'
      case 'refunded':   return 'bg-red-100 text-red-600'
      default:           return 'bg-gray-100 text-gray-600'
    }
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
        <div className="flex items-center gap-4">
          {user?.role === 'client' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              + New Payment
            </button>
          )}
          <button onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm">
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Payments</h2>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-gray-500 text-sm">Total</p>
            <h3 className="text-2xl font-bold text-indigo-600">{payments.length}</h3>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-gray-500 text-sm">In Escrow</p>
            <h3 className="text-2xl font-bold text-yellow-600">
              ₹{payments
                  .filter(p => p.status === 'in-escrow')
                  .reduce((sum, p) => sum + p.amount, 0)}
            </h3>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-gray-500 text-sm">Released</p>
            <h3 className="text-2xl font-bold text-green-600">
              ₹{payments
                  .filter(p => p.status === 'released')
                  .reduce((sum, p) => sum + p.amount, 0)}
            </h3>
          </div>
        </div>

        {/* Create Payment Form */}
        {showForm && user?.role === 'client' && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">New Payment</h3>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gig Select Karo
                </label>
                <select
                  required
                  value={formData.gigId}
                  onChange={(e) => {
                    const gig = myGigs.find(g => g._id === e.target.value)
                    setFormData({
                      ...formData,
                      gigId:        e.target.value,
                      freelancerId: gig?.assignedFreelancer?._id || ''
                    })
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select gig...</option>
                  {myGigs.map(gig => (
                    <option key={gig._id} value={gig._id}>{gig.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number" required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="5000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Escrow Mein Daalo 🔒
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payments List */}
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <p className="text-4xl mb-3">💸</p>
              <p className="text-gray-400">Abhi koi payment nahi!</p>
            </div>
          ) : (
            payments.map(payment => (
              <div key={payment._id}
                className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {payment.gig?.title || 'Gig'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {payment.transactionId}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                    {payment.status === 'in-escrow'  ? '🔒 In Escrow' :
                     payment.status === 'released'   ? '✅ Released' :
                     payment.status === 'refunded'   ? '↩️ Refunded' : payment.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="font-bold text-green-600 text-lg">₹{payment.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Client</p>
                    <p className="font-medium text-gray-700 text-sm">{payment.client?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Freelancer</p>
                    <p className="font-medium text-gray-700 text-sm">{payment.freelancer?.name}</p>
                  </div>
                </div>

                {/* Actions — Client only */}
                {user?.role === 'client' && payment.status === 'in-escrow' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleRelease(payment._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition"
                    >
                      ✅ Release Karo
                    </button>
                    <button
                      onClick={() => handleRefund(payment._id)}
                      className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-200 transition"
                    >
                      ↩️ Refund Karo
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