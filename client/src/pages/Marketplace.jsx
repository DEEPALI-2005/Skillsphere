import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { gigAPI } from '../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'All', 'Web Development', 'Mobile Development', 'UI/UX Design',
  'Graphic Design', 'Content Writing', 'Digital Marketing',
  'Data Science', 'Other'
]

export default function Marketplace() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const fetchGigs = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search)             params.search   = search
      if (category !== 'All') params.category = category
      const res = await gigAPI.getAll(params)
      setGigs(res.data.gigs)
    } catch (err) {
      toast.error('Gigs load nahi hue!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGigs() }, [category])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchGigs()
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1
          onClick={() => navigate('/dashboard')}
          className="text-2xl font-bold text-indigo-600 cursor-pointer"
        >
          SkillSphere
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">👋 {user?.name}</span>
          {user?.role === 'client' && (
            <button
              onClick={() => navigate('/create-gig')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              + Post Gig
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Gig Marketplace</h2>
          <p className="text-gray-500 mt-1">Best projects dhundho aur apply karo!</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search gigs... (React, Design, Writing)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            🔍 Search
          </button>
        </form>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                category === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-indigo-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gigs Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Loading gigs... ⏳</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Koi gig nahi mila 😕</p>
            {user?.role === 'client' && (
              <button
                onClick={() => navigate('/create-gig')}
                className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                + Pehla Gig Post Karo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map(gig => (
              <div
                key={gig._id}
                onClick={() => navigate(`/gig/${gig._id}`)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-indigo-200"
              >
                {/* Category Badge */}
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                  {gig.category}
                </span>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2 line-clamp-2">
                  {gig.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {gig.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {gig.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="font-semibold text-green-600">
                      ₹{gig.budget.min} - ₹{gig.budget.max}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm text-gray-600">📍 {gig.location}</p>
                  </div>
                </div>

                {/* Client + Proposals */}
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-400">
                    👤 {gig.client?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    📝 {gig.proposals?.length || 0} proposals
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}