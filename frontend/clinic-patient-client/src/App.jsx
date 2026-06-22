import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Edit2,
  LogOut,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  User,
  UserPlus,
  X
} from 'react-feather'
import cldhLogo from './cldh.png'
import { Alert } from './components/ui/alert'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './components/ui/dropdown-menu'
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

const inputGroupClass = 'grid gap-2.5'
const selectClass =
  'flex h-11 w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm font-normal text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

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
          <img src={cldhLogo} alt="Central Luzon Doctors' Hospital logo" className="h-28 w-28 object-contain" />
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
  const [searchTerm, setSearchTerm] = useState('')
  const [createdDateFilter, setCreatedDateFilter] = useState('')

  const isEditing = useMemo(() => editingId !== null, [editingId])
  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return patients.filter((patient) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          patient.patientName,
          patient.gender,
          patient.contactNumber,
          patient.address,
          patient.createdBy,
          patient.updatedBy
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch))

      const matchesCreatedDate =
        !createdDateFilter || formatDateInput(patient.createdAt) === createdDateFilter

      return matchesSearch && matchesCreatedDate
    })
  }, [createdDateFilter, patients, searchTerm])

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

  const username = getUsername() || 'admin'

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3.5">
            <img
              src={cldhLogo}
              alt="Central Luzon Doctors' Hospital logo"
              className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-black sm:text-4xl">Patient Management</h1>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="secondary" size="sm" className="self-start lg:self-auto">
                <User size={16} aria-hidden="true" />
                {username}
                <ChevronDown size={15} aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span className="block text-xs font-semibold uppercase text-muted-foreground">Logged in as</span>
                <span className="block text-base text-black">{username}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                className="text-destructive focus:bg-red-50 focus:text-destructive"
              >
                <LogOut size={16} aria-hidden="true" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(360px,33%)_minmax(0,67%)] lg:px-8">
        <section className="grid gap-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardDescription className="font-medium uppercase tracking-normal text-muted-foreground">
                  Patient form
                </CardDescription>
                <CardTitle>{isEditing ? 'Edit Patient' : 'Add Patient'}</CardTitle>
              </div>
              {isEditing ? (
                <Button type="button" variant="ghost" size="icon" onClick={resetForm} title="Cancel edit">
                  <X size={17} aria-hidden="true" />
                </Button>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                  <UserPlus size={17} aria-hidden="true" />
                </div>
              )}
            </CardHeader>

            <CardContent>
              <form className="grid gap-5" onSubmit={handleSubmit} aria-label="Patient form">
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

                <Button type="submit" className="mt-1 h-12 w-full rounded-xl px-5" disabled={saving}>
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
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardDescription className="font-medium uppercase tracking-normal text-muted-foreground">
                {filteredPatients.length} of {patients.length} {patients.length === 1 ? 'record' : 'records'}
              </CardDescription>
              <CardTitle>Patient Records</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-9"
                  placeholder="Search patients"
                  aria-label="Search patient records"
                />
              </div>
              <div className="relative">
                <Calendar
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="date"
                  value={createdDateFilter}
                  onChange={(event) => setCreatedDateFilter(event.target.value)}
                  className="pl-9"
                  aria-label="Filter patient records by created date"
                />
              </div>
            </div>

            {loading ? (
              <EmptyState>Loading patient records...</EmptyState>
            ) : patients.length === 0 ? (
              <EmptyState>No patient records found.</EmptyState>
            ) : filteredPatients.length === 0 ? (
              <EmptyState>No patient records match the current filters.</EmptyState>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-white">
                <table className="w-full min-w-[1240px] border-collapse bg-white text-sm">
                  <colgroup>
                    <col className="w-[190px]" />
                    <col className="w-[120px]" />
                    <col className="w-[82px]" />
                    <col className="w-[135px]" />
                    <col className="w-[220px]" />
                    <col className="w-[150px]" />
                    <col className="w-[95px]" />
                    <col className="w-[150px]" />
                    <col className="w-[105px]" />
                    <col className="w-[110px]" />
                  </colgroup>
                  <thead className="bg-[#F8FAFC]">
                    <tr className="text-left">
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Birth Date</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Contact Number</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Actions</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-t border-border">
                        <TableCell className="font-semibold text-black">{patient.patientName}</TableCell>
                        <TableCell>{formatDateDisplay(patient.birthDate)}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.contactNumber}</TableCell>
                        <TableCell>{patient.address}</TableCell>
                        <TableCell>{formatDateTimeDisplay(patient.createdAt)}</TableCell>
                        <TableCell>{patient.createdBy || 'admin'}</TableCell>
                        <TableCell>{formatDateTimeDisplay(patient.updatedAt) || 'Not updated'}</TableCell>
                        <TableCell>{patient.updatedBy || 'Not updated'}</TableCell>
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
    <div className="grid min-h-[180px] place-items-center rounded-xl border border-dashed border-border bg-muted/50 px-4 text-center text-sm font-medium text-muted-foreground">
      {children}
    </div>
  )
}

function TableHead({ children }) {
  return (
    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
      {children}
    </th>
  )
}

function TableCell({ children, className = '' }) {
  return <td className={`px-5 py-4 align-top font-normal leading-6 text-foreground ${className}`}>{children}</td>
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

function formatDateTimeDisplay(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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
