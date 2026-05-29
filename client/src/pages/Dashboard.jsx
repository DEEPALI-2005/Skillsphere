import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getMe, logout } from '../store/authSlice'
import Notifications from '../components/common/Notifications'
import toast from 'react-hot-toast'
import VerifyBanner from '../components/common/VerifyBanner'

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getMe())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logout ho gaye!')
    navigate('/login')
  }

  const clientLinks = [
    { icon: '🔐', title: '2FA Security', desc: 'Account secure karo', path: '/2fa' },
    { icon: '👤', title: 'Edit Profile', desc: 'Profile update karo', path: '/profile' },
    { icon: '⚖️', title: 'Disputes', desc: 'Payment issues resolve karo', path: '/disputes' },
    { icon: '🛍️', title: 'Marketplace',    desc: 'Gigs dekho aur apply karo',   path: '/marketplace' },
    { icon: '➕', title: 'Post a Gig',      desc: 'Naya project post karo',       path: '/create-gig' },
    { icon: '💰', title: 'Payments',        desc: 'Payments manage karo',         path: '/payments' },
    { icon: '💬', title: 'Messages',        desc: 'Freelancers se baat karo',     path: `/chat/${user?._id}` },
    { icon: '🤖', title: 'AI Matching', desc: 'Best matches dhundho', path: '/ai-match' },
  ]

  const freelancerLinks = [
    { icon: '🔐', title: '2FA Security', desc: 'Account secure karo', path: '/2fa' },
    { icon: '👤', title: 'Edit Profile', desc: 'Profile update karo', path: '/profile' },
    { icon: '📅', title: 'Availability', desc: 'Apni dates set karo', path: '/availability' },
    { icon: '⚖️', title: 'Disputes', desc: 'Payment issues resolve karo', path: '/disputes' },
    { icon: '🛍️', title: 'Marketplace',    desc: 'Projects dhundho',             path: '/marketplace' },
    { icon: '📊', title: 'Analytics',       desc: 'Apni earnings dekho',          path: '/analytics' },
    { icon: '💰', title: 'Payments',        desc: 'Earnings track karo',          path: '/payments' },
    { icon: '⭐', title: 'My Reviews',      desc: 'Client feedback dekho',        path: `/reviews/${user?._id}` },
    { icon: '🤖', title: 'AI Matching', desc: 'Best matches dhundho', path: '/ai-match' },
  ]

  const adminLinks = [
    { icon: '🔐', title: '2FA Security', desc: 'Account secure karo', path: '/2fa' },
    { icon: '👤', title: 'Edit Profile', desc: 'Profile update karo', path: '/profile' },
    { icon: '👥', title: 'Admin Dashboard', desc: 'Platform manage karo',         path: '/admin' },
    { icon: '🛍️', title: 'Marketplace',    desc: 'Sab gigs dekho',               path: '/marketplace' },
    { icon: '💰', title: 'Payments',        desc: 'Sab payments dekho',           path: '/payments' },
    { icon: '🤖', title: 'AI Matching', desc: 'Best matches dhundho', path: '/ai-match' },
  ]

  const links = user?.role === 'client'     ? clientLinks :
                user?.role === 'freelancer' ? freelancerLinks : adminLinks

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">SkillSphere</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 hidden md:block">👋 {user?.name}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            user?.role === 'client'     ? 'bg-blue-100 text-blue-600' :
            user?.role === 'freelancer' ? 'bg-green-100 text-green-600' :
                                          'bg-red-100 text-red-600'
          }`}>
            {user?.role}
          </span>
          <Notifications userId={user?._id} />
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>
      <VerifyBanner />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 🚀
          </h2>
          <p className="text-indigo-100">
            {user?.role === 'client'
              ? 'Post projects aur best freelancers dhundho!'
              : user?.role === 'freelancer'
              ? 'Apne skills se paise kamao!'
              : 'Platform manage karo!'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Active Projects</p>
            <h3 className="text-3xl font-bold text-indigo-600 mt-1">0</h3>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">
              {user?.role === 'client' ? 'Total Spent' : 'Total Earned'}
            </p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">₹0</h3>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Rating</p>
            <h3 className="text-3xl font-bold text-yellow-500 mt-1">
              ⭐ {user?.rating || '0.0'}
            </h3>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {links.map(link => (
              <div
                key={link.path}
                onClick={() => navigate(link.path)}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-indigo-200"
              >
                <span className="text-3xl">{link.icon}</span>
                <h4 className="font-semibold text-gray-800 mt-2">{link.title}</h4>
                <p className="text-gray-500 text-xs mt-1">{link.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">My Profile</h3>
            <button
              onClick={() => navigate('/marketplace')}
              className="text-indigo-600 text-sm hover:underline"
            >
              Marketplace →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-medium">{user?.name || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium">{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Location</p>
              <p className="font-medium">{user?.location || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user?.skills?.length > 0
                  ? user.skills.map(skill => (
                      <span key={skill}
                        className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))
                  : <p className="text-gray-400 text-sm">Koi skill nahi</p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}