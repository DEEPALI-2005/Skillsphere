import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import API from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [gigs, setGigs]     = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchUsers()
    fetchGigs()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats')
      setStats(res.data.stats)
    } catch (err) {
      toast.error('Stats load nahi hue!')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users')
      setUsers(res.data.users)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGigs = async () => {
    try {
      const res = await API.get('/admin/gigs')
      setGigs(res.data.gigs)
    } catch (err) {
      console.log(err)
    }
  }

  const handleSuspend = async (userId) => {
    try {
      const res = await API.put(`/admin/users/${userId}/suspend`)
      toast.success(res.data.message)
      fetchUsers()
    } catch (err) {
      toast.error('Error aaya!')
    }
  }

  const handleVerify = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/verify`)
      toast.success('User verify ho gaya!')
      fetchUsers()
    } catch (err) {
      toast.error('Error aaya!')
    }
  }

  const handleDeleteGig = async (gigId) => {
    try {
      await API.delete(`/admin/gigs/${gigId}`)
      toast.success('Gig delete ho gaya!')
      fetchGigs()
    } catch (err) {
      toast.error('Error aaya!')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
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
        <h1 className="text-2xl font-bold text-indigo-600">
          SkillSphere <span className="text-red-500 text-sm">Admin</span>
        </h1>
        <button onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm text-center">
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</h3>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm text-center">
              <p className="text-gray-500 text-sm">Freelancers</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.totalFreelancers}</h3>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm text-center">
              <p className="text-gray-500 text-sm">Total Gigs</p>
              <h3 className="text-3xl font-bold text-purple-600">{stats.totalGigs}</h3>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm text-center">
              <p className="text-gray-500 text-sm">Revenue</p>
              <h3 className="text-3xl font-bold text-yellow-600">₹{stats.totalRevenue}</h3>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {['stats', 'users', 'gigs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium capitalize transition ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border hover:border-indigo-400'
              }`}
            >
              {tab === 'stats' ? '📊 Stats' :
               tab === 'users' ? '👥 Users' : '💼 Gigs'}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Platform Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Users',      value: stats.totalUsers,       color: 'text-indigo-600' },
                  { label: 'Clients',          value: stats.totalClients,     color: 'text-blue-600' },
                  { label: 'Freelancers',      value: stats.totalFreelancers, color: 'text-green-600' },
                  { label: 'Open Gigs',        value: stats.openGigs,         color: 'text-purple-600' },
                  { label: 'Completed Gigs',   value: stats.completedGigs,    color: 'text-yellow-600' },
                  { label: 'Total Revenue',    value: `₹${stats.totalRevenue}`, color: 'text-red-600' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <p className="text-gray-500">{item.label}</p>
                    <p className={`font-bold text-lg ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full text-left px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                >
                  👥 Manage Users →
                </button>
                <button
                  onClick={() => setActiveTab('gigs')}
                  className="w-full text-left px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
                >
                  💼 Manage Gigs →
                </button>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="w-full text-left px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                >
                  🛍️ View Marketplace →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Verified', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'      ? 'bg-red-100 text-red-600' :
                        user.role === 'freelancer' ? 'bg-green-100 text-green-600' :
                                                     'bg-blue-100 text-blue-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isVerified
                        ? <span className="text-green-500">✅ Verified</span>
                        : <span className="text-gray-400">❌ No</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSuspend(user._id)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            user.isActive
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </button>
                        {!user.isVerified && (
                          <button
                            onClick={() => handleVerify(user._id)}
                            className="px-3 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gigs Tab */}
        {activeTab === 'gigs' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Client', 'Category', 'Budget', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gigs.map(gig => (
                  <tr key={gig._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">
                      {gig.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{gig.client?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{gig.category}</td>
                    <td className="px-4 py-3 text-green-600 font-medium text-sm">
                      ₹{gig.budget?.min} - ₹{gig.budget?.max}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        gig.status === 'open'        ? 'bg-green-100 text-green-600' :
                        gig.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
                        gig.status === 'completed'   ? 'bg-blue-100 text-blue-600' :
                                                       'bg-gray-100 text-gray-600'
                      }`}>
                        {gig.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteGig(gig._id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}