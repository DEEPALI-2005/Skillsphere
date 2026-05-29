import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { gigAPI, proposalAPI } from '../api/axios'
import toast from 'react-hot-toast'

export default function GigDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [gig, setGig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [proposal, setProposal] = useState({
    coverLetter: '', bidAmount: '', deliveryTime: ''
  })

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await gigAPI.getById(id)
        setGig(res.data.gig)
      } catch (err) {
        toast.error('Gig nahi mila!')
        navigate('/marketplace')
      } finally {
        setLoading(false)
      }
    }
    fetchGig()
  }, [id])

  const handleProposalSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await proposalAPI.create(id, {
        coverLetter:  proposal.coverLetter,
        bidAmount:    Number(proposal.bidAmount),
        deliveryTime: Number(proposal.deliveryTime)
      })
      toast.success('Proposal bhej diya!')
      setShowProposalForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kuch galat hua!')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-lg">Loading... ⏳</p>
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
        <button onClick={() => navigate('/marketplace')}
          className="text-indigo-600 hover:underline text-sm">
          ← Marketplace
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left — Gig Detail */}
          <div className="md:col-span-2 space-y-6">

            {/* Main Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                {gig.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 mt-3 mb-2">{gig.title}</h2>
              <p className="text-gray-500 text-sm mb-4">
                Posted by <span className="font-medium text-gray-700">{gig.client?.name}</span>
                {' · '}{new Date(gig.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-700 leading-relaxed">{gig.description}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {gig.skills.map(skill => (
                  <span key={skill} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Proposal Form — Freelancer only */}
            {user?.role === 'freelancer' && gig.status === 'open' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Submit Proposal</h3>
                  <button
                    onClick={() => setShowProposalForm(!showProposalForm)}
                    className="text-indigo-600 text-sm hover:underline"
                  >
                    {showProposalForm ? 'Cancel' : 'Apply Now →'}
                  </button>
                </div>

                {showProposalForm && (
                  <form onSubmit={handleProposalSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Letter
                      </label>
                      <textarea
                        required rows={4}
                        placeholder="Apne experience ke baare mein batao..."
                        value={proposal.coverLetter}
                        onChange={(e) => setProposal({...proposal, coverLetter: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bid Amount (₹)
                        </label>
                        <input
                          type="number" required
                          placeholder="8000"
                          value={proposal.bidAmount}
                          onChange={(e) => setProposal({...proposal, bidAmount: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery (days)
                        </label>
                        <input
                          type="number" required
                          placeholder="30"
                          value={proposal.deliveryTime}
                          onChange={(e) => setProposal({...proposal, deliveryTime: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit" disabled={submitting}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Proposal 🚀'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right — Info Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Gig Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Budget</p>
                  <p className="font-semibold text-green-600 text-lg">
                    ₹{gig.budget.min} - ₹{gig.budget.max}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Deadline</p>
                  <p className="font-medium text-gray-700">
                    📅 {new Date(gig.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="font-medium text-gray-700">📍 {gig.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    gig.status === 'open' ? 'bg-green-100 text-green-600' :
                    gig.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {gig.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Proposals</p>
                  <p className="font-medium text-gray-700">
                    📝 {gig.proposals?.length || 0} proposals
                  </p>
                </div>
              </div>
            </div>

            {/* Client Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Client</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  {gig.client?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{gig.client?.name}</p>
                  <p className="text-xs text-gray-400">📍 {gig.client?.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}