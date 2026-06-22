import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Edit2,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  UserPlus,
  X
} from 'react-feather'
import cldhLogo from './cldh.png'
import { Alert } from './components/ui/alert'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'
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

const inputGroupClass = 'grid gap-2'
const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

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
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <Card className="w-full max-w-[420px]">
        <CardHeader className="space-y-4">
          <img src={cldhLogo} alt="Central Luzon Doctors' Hospital logo" className="h-20 w-20 object-contain" />
          <div className="space-y-1">
            <CardDescription className="font-semibold uppercase tracking-normal text-muted-foreground">
              Clinic Patient Registration
            </CardDescription>
            <CardTitle className="text-3xl text-black">Sign in</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
              <Alert variant="destructive" className="flex items-start gap-3 font-medium">
                <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </Alert>
            )}

            <div className={inputGroupClass}>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                autoComplete="username"
                required
              />
            </div>

            <div className={inputGroupClass}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
              <Shield size={17} aria-hidden="true" />
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
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
    <main className="min-h-screen bg-white">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <img
              src={cldhLogo}
              alt="Central Luzon Doctors' Hospital logo"
              className="h-14 w-14 shrink-0 object-contain"
            />
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Signed in as {getUsername() || 'admin'}</p>
              <h1 className="text-2xl font-semibold tracking-normal text-black sm:text-3xl">Patient Management</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={loadPatients} disabled={loading}>
              <RefreshCw size={16} aria-hidden="true" className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button type="button" onClick={handleLogout}>
              <LogOut size={16} aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
        <section className="grid gap-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardDescription className="font-semibold uppercase tracking-normal text-muted-foreground">
                  Patient form
                </CardDescription>
                <CardTitle>{isEditing ? 'Edit Patient' : 'Add Patient'}</CardTitle>
              </div>
              {isEditing ? (
                <Button type="button" variant="ghost" size="icon" onClick={resetForm} title="Cancel edit">
                  <X size={17} aria-hidden="true" />
                </Button>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-primary">
                  <UserPlus size={17} aria-hidden="true" />
                </div>
              )}
            </CardHeader>

            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit} aria-label="Patient form">
                <div className={inputGroupClass}>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={form.patientName}
                    onChange={(event) => updateField('patientName', event.target.value)}
                    required
                  />
                </div>

                <div className={inputGroupClass}>
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={(event) => updateField('birthDate', event.target.value)}
                    required
                  />
                </div>

                <div className={inputGroupClass}>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className={selectClass}
                    value={form.gender}
                    onChange={(event) => updateField('gender', event.target.value)}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={inputGroupClass}>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={form.contactNumber}
                    onChange={(event) => updateField('contactNumber', event.target.value)}
                    required
                  />
                </div>

                <div className={inputGroupClass}>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(event) => updateField('address', event.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="mt-1 w-full" disabled={saving}>
                  {isEditing ? <Save size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
                  {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Patient'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="flex items-start gap-3 font-medium">
              <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </Alert>
          )}
        </section>

        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardDescription className="font-semibold uppercase tracking-normal text-muted-foreground">
                {patients.length} {patients.length === 1 ? 'record' : 'records'}
              </CardDescription>
              <CardTitle>Patient Records</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <EmptyState>Loading patient records...</EmptyState>
            ) : patients.length === 0 ? (
              <EmptyState>No patient records found.</EmptyState>
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[780px] border-collapse bg-white text-sm">
                  <thead className="bg-muted">
                    <tr className="text-left">
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Birth Date</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Contact Number</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id} className="border-t border-border">
                        <TableCell className="font-semibold text-black">{patient.patientName}</TableCell>
                        <TableCell>{formatDateDisplay(patient.birthDate)}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.contactNumber}</TableCell>
                        <TableCell>{patient.address}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              onClick={() => startEdit(patient)}
                              title="Edit patient"
                            >
                              <Edit2 size={15} aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-red-50 hover:text-destructive"
                              onClick={() => handleDelete(patient)}
                              disabled={deletingId === patient.id}
                              title="Delete patient"
                            >
                              <Trash2 size={15} aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function EmptyState({ children }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-md border border-dashed border-border bg-muted/50 px-4 text-center text-sm font-semibold text-muted-foreground">
      {children}
    </div>
  )
}

function TableHead({ children }) {
  return <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal text-muted-foreground">{children}</th>
}

function TableCell({ children, className = '' }) {
  return <td className={`px-4 py-3 align-top text-foreground ${className}`}>{children}</td>
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
