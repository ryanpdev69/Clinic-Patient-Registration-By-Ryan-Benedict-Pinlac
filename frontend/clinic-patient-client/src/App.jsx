import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { LogOut, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import {
  clearSession,
  createPatient,
  deletePatient,
  getPatients,
  getToken,
  getUsername,
  login,
  logout,
  saveSession,
  updatePatient
} from './api'

const emptyPatient = {
  patientName: '',
  birthDate: '',
  gender: '',
  contactNumber: '',
  address: ''
}

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (getToken()) {
      navigate('/patients', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const session = await login(form)
      saveSession(session)
      navigate('/patients', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <div>
          <p className="eyebrow">Clinic Patient Registration</p>
          <h1 id="login-title">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="stack">
          {error && <div className="alert error">{error}</div>}

          <label>
            Username
            <input
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  )
}

function PatientsPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState(emptyPatient)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const isEditing = useMemo(() => editingId !== null, [editingId])

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    setLoading(true)
    setError('')

    try {
      const data = await getPatients()
      setPatients(data)
    } catch (requestError) {
      handleRequestError(requestError)
    } finally {
      setLoading(false)
    }
  }

  function handleRequestError(requestError) {
    setError(requestError.message)
    if (requestError.status === 401) {
      navigate('/login', { replace: true })
    }
  }

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function startEdit(patient) {
    setEditingId(patient.id)
    setForm({
      patientName: patient.patientName,
      birthDate: formatDateInput(patient.birthDate),
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      address: patient.address
    })
    setError('')
  }

  function resetForm() {
    setForm(emptyPatient)
    setEditingId(null)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (isEditing) {
        await updatePatient(editingId, form)
      } else {
        await createPatient(form)
      }

      resetForm()
      await loadPatients()
    } catch (requestError) {
      handleRequestError(requestError)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(patient) {
    const confirmed = window.confirm(`Delete patient record for ${patient.patientName}?`)
    if (!confirmed) {
      return
    }

    setDeletingId(patient.id)
    setError('')

    try {
      await deletePatient(patient.id)
      await loadPatients()
      if (editingId === patient.id) {
        resetForm()
      }
    } catch (requestError) {
      handleRequestError(requestError)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Signed in as {getUsername() || 'admin'}</p>
          <h1>Patient Management</h1>
        </div>
        <button type="button" className="secondary-button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden="true" />
          Logout
        </button>
      </header>

      {error && <div className="alert error">{error}</div>}

      <section className="content-grid">
        <form className="patient-form" onSubmit={handleSubmit} aria-label="Patient form">
          <div className="form-title-row">
            <h2>{isEditing ? 'Edit Patient' : 'Add Patient'}</h2>
            {isEditing && (
              <button type="button" className="icon-button" onClick={resetForm} title="Cancel edit">
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>

          <label>
            Patient Name
            <input
              value={form.patientName}
              onChange={(event) => updateField('patientName', event.target.value)}
              required
            />
          </label>

          <label>
            Birth Date
            <input
              type="date"
              value={form.birthDate}
              onChange={(event) => updateField('birthDate', event.target.value)}
              required
            />
          </label>

          <label>
            Gender
            <select
              value={form.gender}
              onChange={(event) => updateField('gender', event.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Contact Number
            <input
              value={form.contactNumber}
              onChange={(event) => updateField('contactNumber', event.target.value)}
              required
            />
          </label>

          <label>
            Address
            <textarea
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
              rows="3"
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={saving}>
            {isEditing ? <Save size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Patient'}
          </button>
        </form>

        <section className="table-section" aria-labelledby="patients-title">
          <div className="table-header">
            <h2 id="patients-title">Patient Records</h2>
            <button type="button" className="secondary-button" onClick={loadPatients} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="empty-state">Loading patient records...</div>
          ) : patients.length === 0 ? (
            <div className="empty-state">No patient records found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Birth Date</th>
                    <th>Gender</th>
                    <th>Contact Number</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.patientName}</td>
                      <td>{formatDateDisplay(patient.birthDate)}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.contactNumber}</td>
                      <td>{patient.address}</td>
                      <td>
                        <div className="action-row">
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => startEdit(patient)}
                            title="Edit patient"
                          >
                            <Pencil size={17} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            onClick={() => handleDelete(patient)}
                            disabled={deletingId === patient.id}
                            title="Delete patient"
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function formatDateInput(value) {
  return value ? value.slice(0, 10) : ''
}

function formatDateDisplay(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value))
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <PatientsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={getToken() ? '/patients' : '/login'} replace />} />
    </Routes>
  )
}
