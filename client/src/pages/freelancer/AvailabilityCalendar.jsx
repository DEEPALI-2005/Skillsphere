import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import API from '../../api/axios'
import toast from 'react-hot-toast'

export default function AvailabilityCalendar() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [selectedDates, setSelectedDates] = useState([])
  const [loading, setLoading]             = useState(false)

  const isAvailable = (date) => {
    return selectedDates.some(d =>
      new Date(d).toDateString() === date.toDateString()
    )
  }

  const toggleDate = (date) => {
    const exists = selectedDates.some(
      d => new Date(d).toDateString() === date.toDateString()
    )
    if (exists) {
      setSelectedDates(selectedDates.filter(
        d => new Date(d).toDateString() !== date.toDateString()
      ))
    } else {
      setSelectedDates([...selectedDates, date])
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await API.put('/users/profile', {
        availability: selectedDates
      })
      toast.success('Availability save ho gayi! ✅')
    } catch (err) {
      toast.error('Save nahi hua!')
    } finally {
      setLoading(false)
    }
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

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📅 Availability Calendar</h2>
        <p className="text-gray-500 mb-6">Jin dates pe available ho unhe select karo!</p>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">

          {/* Legend */}
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span className="text-gray-600">Unavailable</span>
            </div>
          </div>

          {/* Calendar */}
          <style>{`
            .react-calendar { width: 100%; border: none; font-family: inherit; }
            .react-calendar__tile { padding: 12px; border-radius: 8px; }
            .react-calendar__tile:hover { background: #e0e7ff; }
            .react-calendar__tile--active { background: #6366f1 !important; color: white; }
            .available-date { background: #dcfce7 !important; color: #16a34a !important; font-weight: 600; }
            .react-calendar__navigation button { font-size: 16px; }
          `}</style>

          <Calendar
            onClickDay={toggleDate}
            tileClassName={({ date }) =>
              isAvailable(date) ? 'available-date' : ''
            }
            minDate={new Date()}
          />
        </div>

        {/* Selected Dates */}
        {selectedDates.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Selected Dates ({selectedDates.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedDates
                .sort((a, b) => new Date(a) - new Date(b))
                .map((date, idx) => (
                  <span
                    key={idx}
                    onClick={() => toggleDate(new Date(date))}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-red-100 hover:text-red-600 transition"
                  >
                    {new Date(date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short'
                    })} ✕
                  </span>
                ))
              }
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Save ho raha hai...' : 'Availability Save Karo ✅'}
        </button>
      </div>
    </div>
  )
}