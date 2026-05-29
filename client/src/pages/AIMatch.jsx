import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function AIMatch() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [myGigs, setMyGigs]           = useState([])
  const [selectedGig, setSelectedGig] = useState('')
  const [matches, setMatches]         = useState([])
  const [trending, setTrending]       = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading]         = useState(false)
  const [activeTab, setActiveTab]     = useState(
    user?.role === 'client' ? 'match' : 'recommend'
  )

  useEffect(() => {
    fetchTrending()
    if (user?.role === 'client')     fetchMyGigs()
    if (user?.role === 'freelancer') fetchRecommended()
  }, [])

  const fetchMyGigs = async () => {
    try {
      const res = await API.get('/gigs/my')
      setMyGigs(res.data.gigs)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchTrending = async () => {
    try {
      const res = await API.get('/ai/trending')
      setTrending(res.data.trending)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchRecommended = async () => {
    try {
      const res = await API.get('/ai/recommend')
      setRecommended(res.data.recommendations)
    } catch (err) {
      console.log(err)
    }
  }

  const handleMatch = async () => {
    if (!selectedGig) return toast.error('Pehle gig select karo!')
    setLoading(true)
    try {
      const res = await API.get(`/ai/match/${selectedGig}`)
      setMatches(res.data.matches)
      toast.success(`${res.data.totalFound} freelancers mile!`)
    } catch (err) {
      toast.error('Matching nahi hui!')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
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

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-1">🤖 AI Matching Engine</h2>
          <p className="text-indigo-100">
            HuggingFace AI se best matches dhundho!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {user?.role === 'client' && (
            <button
              onClick={() => setActiveTab('match')}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                activeTab === 'match'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border hover:border-indigo-400'
              }`}
            >
              🎯 Freelancer Match
            </button>
          )}
          {user?.role === 'freelancer' && (
            <button
              onClick={() => setActiveTab('recommend')}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                activeTab === 'recommend'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border hover:border-indigo-400'
              }`}
            >
              💡 Recommended Gigs
            </button>
          )}
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              activeTab === 'trending'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border hover:border-indigo-400'
            }`}
          >
            🔥 Trending Skills
          </button>
        </div>

        {/* Match Tab — Client */}
        {activeTab === 'match' && user?.role === 'client' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">
                Gig ke liye Best Freelancers Dhundho
              </h3>
              <div className="flex gap-3">
                <select
                  value={selectedGig}
                  onChange={(e) => setSelectedGig(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Gig select karo...</option>
                  {myGigs.map(gig => (
                    <option key={gig._id} value={gig._id}>{gig.title}</option>
                  ))}
                </select>
                <button
                  onClick={handleMatch}
                  disabled={loading || !selectedGig}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
                >
                  {loading ? '🤖 Matching...' : '🎯 Match Karo'}
                </button>
              </div>
            </div>

            {/* Results */}
            {matches.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">
                  Top {matches.length} Matches 🎯
                </h3>
                {matches.map((match, idx) => (
                  <div key={match.freelancer._id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                          idx === 1 ? 'bg-gray-100 text-gray-600' :
                          idx === 2 ? 'bg-orange-100 text-orange-600' :
                                      'bg-indigo-50 text-indigo-600'
                        }`}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          {match.freelancer.avatar
                            ? <img src={match.freelancer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            : <span className="text-indigo-600 font-bold text-lg">
                                {match.freelancer.name?.charAt(0)}
                              </span>
                          }
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">{match.freelancer.name}</p>
                          <p className="text-sm text-gray-500">
                            📍 {match.freelancer.location || 'Remote'} •
                            ⭐ {match.freelancer.rating || 0} •
                            ₹{match.freelancer.hourlyRate || 0}/hr
                          </p>
                          {match.matchedSkills.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {match.matchedSkills.map(skill => (
                                <span key={skill}
                                  className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs">
                                  ✓ {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="text-right space-y-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(match.finalScore)}`}>
                          {match.finalScore}% Match
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400">
                          <span>AI: {match.aiScore}%</span>
                          <span>Rating: {match.ratingScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/chat/${match.freelancer._id}`)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
                      >
                        💬 Message Karo
                      </button>
                      <button
                        onClick={() => navigate(`/reviews/${match.freelancer._id}`)}
                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
                      >
                        ⭐ Reviews Dekho
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {matches.length === 0 && !loading && selectedGig && (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <p className="text-gray-400">Koi match nahi mila! 😕</p>
              </div>
            )}
          </div>
        )}

        {/* Recommend Tab — Freelancer */}
        {activeTab === 'recommend' && user?.role === 'freelancer' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">
              Tumhare Skills Se Match Gigs 💡
            </h3>
            {recommended.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <p className="text-gray-400">Koi recommended gig nahi! Skills add karo profile mein.</p>
              </div>
            ) : (
              recommended.map(({ gig, matchScore, matchedSkills }) => (
                <div key={gig._id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/gig/${gig._id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{gig.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        👤 {gig.client?.name} •
                        💰 ₹{gig.budget?.min} - ₹{gig.budget?.max}
                      </p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {matchedSkills.map(skill => (
                          <span key={skill}
                            className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs">
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(matchScore)}`}>
                      {matchScore}% Match
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">🔥 Trending Skills</h3>
            {trending.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Abhi koi data nahi!</p>
            ) : (
              <div className="space-y-3">
                {trending.map(({ skill, count }, idx) => (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-gray-400 w-6 text-sm">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-800">{skill}</span>
                        <span className="text-gray-500 text-sm">{count} gigs</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${Math.min((count / trending[0].count) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}