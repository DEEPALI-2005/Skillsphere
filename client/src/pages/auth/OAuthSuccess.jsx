import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getMe } from '../../store/authSlice'

export default function OAuthSuccess() {
  const navigate      = useNavigate()
  const dispatch      = useDispatch()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      dispatch(getMe())
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Google login ho raha hai... ⏳</p>
    </div>
  )
}