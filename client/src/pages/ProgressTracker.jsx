import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function ProgressTracker() {
  const { gigId }  = useParams()
  const navigate   = useNavigate()
  const { user }   = useSelector((state) => state.auth)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [newTask, setNewTask]   = useState({ title: '', description: '' })
  const [newLog, setNewLog]     = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTrackerTasks, setNewTrackerTasks] = useState([{ title: '', description: '' }])

  useEffect(() => { fetchProgress() }, [gigId])

  const fetchProgress = async () => {
    try {
      const res = await API.get(`/progress/${gigId}`)
      setProgress(res.data.progress)
    } catch (err) {
      // Progress nahi hai — create karna hoga
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await API.post('/progress', {
        gigId,
        tasks: newTrackerTasks.filter(t => t.title.trim())
      })
      setProgress(res.data.progress)
      toast.success('Progress tracker ban gaya!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error aaya!')
    } finally {
      setCreating(false)
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      const res = await API.put(`/progress/${gigId}/task/${taskId}`)
      setProgress(res.data.progress)
      toast.success('Task updated!')
    } catch (err) {
      toast.error('Error aaya!')
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post(`/progress/${gigId}/task`, newTask)
      setProgress(res.data.progress)
      setNewTask({ title: '', description: '' })
      setShowTaskForm(false)
      toast.success('Task add ho gaya!')
    } catch (err) {
      toast.error('Error aaya!')
    }
  }

  const handleAddLog = async (e) => {
    e.preventDefault()
    if (!newLog.trim()) return
    try {
      const res = await API.post(`/progress/${gigId}/log`, { message: newLog })
      setProgress(res.data.progress)
      setNewLog('')
      toast.success('Log add ho gaya!')
    } catch (err) {
      toast.error('Error aaya!')
    }
  }

  // Deadline check
  const getDaysLeft = (deadline) => {
    if (!deadline) return null
    const diff = new Date(deadline) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
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
        <button onClick={() => navigate(-1)}
          className="text-indigo-600 hover:underline text-sm">
          ← Back
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Progress Tracker</h2>

        {/* No Progress — Create Karo */}
        {!progress ? (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Progress Tracker Banao</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-3">
                {newTrackerTasks.map((task, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input
                      type="text"
                      placeholder={`Task ${idx + 1} title`}
                      value={task.title}
                      onChange={(e) => {
                        const updated = [...newTrackerTasks]
                        updated[idx].title = e.target.value
                        setNewTrackerTasks(updated)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={task.description}
                      onChange={(e) => {
                        const updated = [...newTrackerTasks]
                        updated[idx].description = e.target.value
                        setNewTrackerTasks(updated)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setNewTrackerTasks([...newTrackerTasks, { title: '', description: '' }])}
                className="text-indigo-600 text-sm hover:underline"
              >
                + Task Add Karo
              </button>

              <button
                type="submit" disabled={creating}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {creating ? 'Ban raha hai...' : 'Progress Tracker Banao 🚀'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Progress Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">
                  {progress.gig?.title}
                </h3>
                {progress.deadline && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getDaysLeft(progress.deadline) < 0  ? 'bg-red-100 text-red-600' :
                    getDaysLeft(progress.deadline) < 7  ? 'bg-yellow-100 text-yellow-600' :
                                                          'bg-green-100 text-green-600'
                  }`}>
                    {getDaysLeft(progress.deadline) < 0
                      ? `${Math.abs(getDaysLeft(progress.deadline))} din late!`
                      : `${getDaysLeft(progress.deadline)} din bacha`
                    }
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">Overall Progress</span>
                <span className="font-bold text-indigo-600">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 mb-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    progress.percentage === 100 ? 'bg-green-500' :
                    progress.percentage > 50    ? 'bg-indigo-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <div className="flex gap-4 text-sm text-gray-500">
                <span>✅ {progress.tasks.filter(t => t.isCompleted).length} complete</span>
                <span>⏳ {progress.tasks.filter(t => !t.isCompleted).length} remaining</span>
                <span>📋 {progress.tasks.length} total</span>
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Tasks</h3>
                {user?.role === 'freelancer' && (
                  <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="text-indigo-600 text-sm hover:underline"
                  >
                    + Task Add Karo
                  </button>
                )}
              </div>

              {/* Add Task Form */}
              {showTaskForm && (
                <form onSubmit={handleAddTask} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                  <input
                    type="text" required
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <div className="flex gap-2">
                    <button type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                      Add
                    </button>
                    <button type="button" onClick={() => setShowTaskForm(false)}
                      className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-3">
                {progress.tasks.map(task => (
                  <div
                    key={task._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                      task.isCompleted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => handleCompleteTask(task._id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        task.isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-indigo-500'
                      }`}
                    >
                      {task.isCompleted && '✓'}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-400">{task.description}</p>
                      )}
                    </div>
                    {task.isCompleted && task.completedAt && (
                      <span className="text-xs text-green-500">
                        {new Date(task.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Logs */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">📝 Progress Logs</h3>

              {/* Add Log */}
              <form onSubmit={handleAddLog} className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Update likho..."
                  value={newLog}
                  onChange={(e) => setNewLog(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                  Add Log
                </button>
              </form>

              {/* Logs List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {progress.logs.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Koi log nahi!</p>
                ) : (
                  [...progress.logs].reverse().map((log, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <span className="text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      <span className="text-gray-600">— {log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}