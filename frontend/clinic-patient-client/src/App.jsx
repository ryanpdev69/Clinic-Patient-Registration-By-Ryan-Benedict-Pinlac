import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Edit2,
  Eye,
  EyeOff,
  Hash,
  Lock,
  LogOut,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserPlus
} from 'react-feather'
import cldhLogo from './cldh.png'
import { Alert } from './components/ui/alert'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './components/ui/dialog'
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

const inputGroupClass = 'grid gap-2'
const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
const loginInputClass =
  'h-12 border-input pl-11 pr-11 text-[15px] transition-all duration-200 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary'
const todayDate = formatDateInput(new Date().toISOString())
const oldestAllowedBirthDate = formatDateInput(getDateYearsAgo(120).toISOString())
const rememberedUsernameKey = 'clinic_patient_remembered_username'

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: localStorage.getItem(rememberedUsernameKey) || '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(Boolean(localStorage.getItem(rememberedUsernameKey)))
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (getToken()) {
      navigate('/patients', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const validationErrors = validateLoginForm(form)

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    try {
      const session = await login(form)
      saveSession(session)

      if (rememberMe) {
        localStorage.setItem(rememberedUsernameKey, form.username.trim())
      } else {
        localStorage.removeItem(rememberedUsernameKey)
      }

      navigate('/patients', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateLoginField(field, value) {
    const nextForm = { ...form, [field]: value }
    setForm(nextForm)

    if (Object.keys(formErrors).length > 0) {
      setFormErrors(validateLoginForm(nextForm))
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4 py-10">
      <div className="grid w-full max-w-[440px] gap-4">
        <Card className="relative w-full overflow-hidden rounded-xl border-transparent bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="h-1.5 bg-primary" aria-hidden="true" />
          <CardHeader className="items-center space-y-5 px-8 pb-5 pt-8 text-center">
            <img src={cldhLogo} alt="Central Luzon Doctors' Hospital logo" className="h-32 w-32 object-contain" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary">Central Luzon Doctors' Hospital</p>
              <CardDescription className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
                Clinic Patient Registration
              </CardDescription>
              <CardTitle className="text-[28px] font-bold leading-tight text-black">Sign in</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
              {error && (
                <Alert variant="destructive" className="flex items-start gap-3 px-3 py-3 font-medium">
                  <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </Alert>
              )}

            <div className="grid gap-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="username"
                  value={form.username}
                  onChange={(event) => updateLoginField('username', event.target.value)}
                  autoComplete="username"
                  placeholder="Enter username"
                  aria-invalid={Boolean(formErrors.username)}
                  aria-describedby="username-error"
                  className={loginInputClass}
                />
              </div>
              <FieldError id="username-error" message={formErrors.username} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => updateLoginField('password', event.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  aria-invalid={Boolean(formErrors.password)}
                  aria-describedby="password-error"
                  className={loginInputClass}
                />
                <button
                  type="button"
                  className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              <FieldError id="password-error" message={formErrors.password} />
            </div>

            <div className="flex">
              <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="h-12 w-full bg-primary text-[15px] transition-colors duration-200 hover:bg-[#1e4b8f] active:bg-[#0d2b59]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
              ) : (
                <Shield size={17} aria-hidden="true" />
              )}
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>
            </form>
          </CardContent>
        </Card>

        <section className="rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-primary">Sample login credentials</p>
          <div className="mt-2 grid gap-1 font-medium">
            <p>
              Username: <span className="font-bold text-slate-900">admin</span>
            </p>
            <p>
              Password: <span className="font-bold text-slate-900">admin123</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

function PatientsPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState(emptyPatient)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [birthDateFilter, setBirthDateFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [editPatient, setEditPatient] = useState(null)
  const [editForm, setEditForm] = useState(emptyPatient)
  const [editFormErrors, setEditFormErrors] = useState({})
  const [detailPatient, setDetailPatient] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

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

      const matchesBirthDate =
        !birthDateFilter || formatDateInput(patient.birthDate) === birthDateFilter

      const matchesGender = !genderFilter || patient.gender === genderFilter

      return matchesSearch && matchesBirthDate && matchesGender
    })
  }, [birthDateFilter, genderFilter, patients, searchTerm])

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
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [field]: value }

      setFormErrors((currentErrors) => {
        if (Object.keys(currentErrors).length === 0) {
          return currentErrors
        }

        return validatePatientForm(nextForm, patients)
      })

      return nextForm
    })
  }

  function startEdit(patient) {
    setEditPatient(patient)
    setEditForm({
      patientName: patient.patientName,
      birthDate: formatDateInput(patient.birthDate),
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      address: patient.address
    })
    setError('')
    setEditFormErrors({})
  }

  function resetForm() {
    setForm(emptyPatient)
    setError('')
    setFormErrors({})
  }

  function closeEditModal() {
    setEditPatient(null)
    setEditForm(emptyPatient)
    setEditFormErrors({})
  }

  function updateEditField(field, value) {
    setEditForm((currentForm) => {
      const nextForm = { ...currentForm, [field]: value }

      setEditFormErrors((currentErrors) => {
        if (Object.keys(currentErrors).length === 0) {
          return currentErrors
        }

        return validatePatientForm(nextForm, patients, editPatient?.id)
      })

      return nextForm
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const validationErrors = validatePatientForm(form, patients)

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    setSaving(true)
    setFormErrors({})

    try {
      await createPatient(form)
      resetForm()
      await loadPatients()
    } catch (requestError) {
      handleRequestError(requestError)
    } finally {
      setSaving(false)
    }
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    setError('')

    if (!editPatient) {
      return
    }

    const validationErrors = validatePatientForm(editForm, patients, editPatient.id)

    if (Object.keys(validationErrors).length > 0) {
      setEditFormErrors(validationErrors)
      return
    }

    setEditSaving(true)
    setEditFormErrors({})

    try {
      await updatePatient(editPatient.id, editForm)
      closeEditModal()
      await loadPatients()
    } catch (requestError) {
      handleRequestError(requestError)
    } finally {
      setEditSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }

    setDeletingId(deleteTarget.id)
    setError('')

    try {
      await deletePatient(deleteTarget.id)
      await loadPatients()
      if (editPatient?.id === deleteTarget.id) {
        closeEditModal()
      }
      if (detailPatient?.id === deleteTarget.id) {
        setDetailPatient(null)
      }
      setDeleteTarget(null)
    } catch (requestError) {
      handleRequestError(requestError)
    } finally {
      setDeletingId(null)
    }
  }

  async function confirmLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const username = getUsername() || 'admin'

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-2 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src={cldhLogo}
              alt="Central Luzon Doctors' Hospital logo"
              className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-black sm:text-3xl">Patient Management</h1>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="secondary" className="self-start lg:self-auto">
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
                onSelect={() => setLogoutConfirmOpen(true)}
                className="text-destructive focus:bg-red-50 focus:text-destructive"
              >
                <LogOut size={16} aria-hidden="true" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <CardTitle>Add Patient</CardTitle>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-primary">
                <UserPlus size={17} aria-hidden="true" />
              </div>
            </CardHeader>

            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit} aria-label="Patient form">
                <div className={inputGroupClass}>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={form.patientName}
                    onChange={(event) => updateField('patientName', formatPatientNameInput(event.target.value))}
                    maxLength={50}
                    placeholder="Juan Dela Cruz"
                    aria-invalid={Boolean(formErrors.patientName)}
                    aria-describedby="patientName-error"
                    required
                  />
                  <FieldError id="patientName-error" message={formErrors.patientName} />
                </div>

                <div className={inputGroupClass}>
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={(event) => updateField('birthDate', event.target.value)}
                    min={oldestAllowedBirthDate}
                    max={todayDate}
                    aria-invalid={Boolean(formErrors.birthDate)}
                    aria-describedby="birthDate-error"
                    required
                  />
                  <FieldError id="birthDate-error" message={formErrors.birthDate} />
                </div>

                <div className={inputGroupClass}>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className={selectClass}
                    value={form.gender}
                    onChange={(event) => updateField('gender', event.target.value)}
                    aria-invalid={Boolean(formErrors.gender)}
                    aria-describedby="gender-error"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                  <FieldError id="gender-error" message={formErrors.gender} />
                </div>

                <div className={inputGroupClass}>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={form.contactNumber}
                    onChange={(event) =>
                      updateField('contactNumber', formatContactNumberInput(event.target.value, form.contactNumber))
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={11}
                    placeholder="09123456789"
                    aria-invalid={Boolean(formErrors.contactNumber)}
                    aria-describedby="contactNumber-error"
                    required
                  />
                  <FieldError id="contactNumber-error" message={formErrors.contactNumber} />
                </div>

                <div className={inputGroupClass}>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(event) => updateField('address', formatAddressInput(event.target.value))}
                    maxLength={100}
                  placeholder="123 Mabini St., Tarlac City"
                    aria-invalid={Boolean(formErrors.address)}
                    aria-describedby="address-error"
                    required
                  />
                  <FieldError id="address-error" message={formErrors.address} />
                </div>

                <Button type="submit" className="mt-1 w-full" disabled={saving}>
                  <Plus size={17} aria-hidden="true" />
                  {saving ? 'Saving...' : 'Add Patient'}
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
                {filteredPatients.length} of {patients.length} {patients.length === 1 ? 'record' : 'records'}
              </CardDescription>
              <CardTitle>Patient Records</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px]">
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
                <UserCheck
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <select
                  value={genderFilter}
                  onChange={(event) => setGenderFilter(event.target.value)}
                  className={`${selectClass} pl-9`}
                  aria-label="Filter patient records by gender"
                >
                  <option value="">All genders</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div className="relative">
                <Calendar
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="date"
                  value={birthDateFilter}
                  onChange={(event) => setBirthDateFilter(event.target.value)}
                  className="birth-date-filter px-9 text-center"
                  aria-label="Filter patient records by birth date"
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
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[760px] border-collapse bg-white text-sm">
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
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-t border-border">
                        <TableCell className="font-semibold text-black">{patient.patientName}</TableCell>
                        <TableCell>{formatDateDisplay(patient.birthDate)}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.contactNumber}</TableCell>
                        <TableCell>{patient.address}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="ghost" size="icon" title="Patient actions">
                                <MoreHorizontal size={16} aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setDetailPatient(patient)}>
                                <Eye size={16} aria-hidden="true" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => startEdit(patient)}>
                                <Edit2 size={16} aria-hidden="true" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => setDeleteTarget(patient)}
                                className="text-destructive focus:bg-red-50 focus:text-destructive"
                              >
                                <Trash2 size={16} aria-hidden="true" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <Dialog open={Boolean(editPatient)} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update the selected patient record.</DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={handleEditSubmit}>
            <div className={inputGroupClass}>
              <Label htmlFor="editPatientName">Patient Name</Label>
              <Input
                id="editPatientName"
                value={editForm.patientName}
                onChange={(event) => updateEditField('patientName', formatPatientNameInput(event.target.value))}
                maxLength={50}
                placeholder="Juan Dela Cruz"
                aria-invalid={Boolean(editFormErrors.patientName)}
                aria-describedby="editPatientName-error"
                required
              />
              <FieldError id="editPatientName-error" message={editFormErrors.patientName} />
            </div>

            <div className={inputGroupClass}>
              <Label htmlFor="editBirthDate">Birth Date</Label>
              <Input
                id="editBirthDate"
                type="date"
                value={editForm.birthDate}
                onChange={(event) => updateEditField('birthDate', event.target.value)}
                min={oldestAllowedBirthDate}
                max={todayDate}
                aria-invalid={Boolean(editFormErrors.birthDate)}
                aria-describedby="editBirthDate-error"
                required
              />
              <FieldError id="editBirthDate-error" message={editFormErrors.birthDate} />
            </div>

            <div className={inputGroupClass}>
              <Label htmlFor="editGender">Gender</Label>
              <select
                id="editGender"
                className={selectClass}
                value={editForm.gender}
                onChange={(event) => updateEditField('gender', event.target.value)}
                aria-invalid={Boolean(editFormErrors.gender)}
                aria-describedby="editGender-error"
                required
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
              <FieldError id="editGender-error" message={editFormErrors.gender} />
            </div>

            <div className={inputGroupClass}>
              <Label htmlFor="editContactNumber">Contact Number</Label>
              <Input
                id="editContactNumber"
                value={editForm.contactNumber}
                onChange={(event) =>
                  updateEditField('contactNumber', formatContactNumberInput(event.target.value, editForm.contactNumber))
                }
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                placeholder="09123456789"
                aria-invalid={Boolean(editFormErrors.contactNumber)}
                aria-describedby="editContactNumber-error"
                required
              />
              <FieldError id="editContactNumber-error" message={editFormErrors.contactNumber} />
            </div>

            <div className={inputGroupClass}>
              <Label htmlFor="editAddress">Address</Label>
              <Textarea
                id="editAddress"
                value={editForm.address}
                onChange={(event) => updateEditField('address', formatAddressInput(event.target.value))}
                maxLength={100}
                placeholder="123 Mabini St., Tarlac City"
                aria-invalid={Boolean(editFormErrors.address)}
                aria-describedby="editAddress-error"
                required
              />
              <FieldError id="editAddress-error" message={editFormErrors.address} />
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={editSaving}>
                <Save size={17} aria-hidden="true" />
                {editSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(detailPatient)} onOpenChange={(open) => !open && setDetailPatient(null)}>
        <DialogContent className="max-w-2xl gap-5 p-0">
          <DialogHeader className="border-b border-border px-6 pb-5 pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User size={22} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <DialogTitle>Patient Record</DialogTitle>
                <DialogDescription>Review patient information</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {detailPatient && (
            <div className="grid gap-6 px-6">
              <div className="flex items-center gap-4 rounded-xl bg-muted/50 px-4 py-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                  <User size={24} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-semibold text-black">{detailPatient.patientName}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <GenderChip gender={detailPatient.gender} />
                    <span>Born {formatLongDateDisplay(detailPatient.birthDate)}</span>
                  </div>
                </div>
              </div>

              <DetailSection title="Personal">
                <DetailRow icon={Hash} label="Patient ID" value={formatPatientId(detailPatient.id)} />
                <DetailRow icon={User} label="Patient Name" value={detailPatient.patientName} />
                <DetailRow icon={Calendar} label="Birth Date" value={formatLongDateDisplay(detailPatient.birthDate)} />
                <DetailRow icon={UserCheck} label="Gender" value={<GenderChip gender={detailPatient.gender} />} />
              </DetailSection>

              <DetailSection title="Contact">
                <DetailRow icon={Phone} label="Contact Number" value={detailPatient.contactNumber} />
                <DetailRow icon={MapPin} label="Address" value={detailPatient.address} />
              </DetailSection>

              <DetailSection title="System">
                <DetailRow icon={UserCheck} label="Created By" value={detailPatient.createdBy || 'admin'} />
                <DetailRow icon={Calendar} label="Created At" value={formatCleanDateTimeDisplay(detailPatient.createdAt)} />
                <DetailRow icon={UserCheck} label="Updated By" value={detailPatient.updatedBy || 'Not updated'} />
                <DetailRow
                  icon={Calendar}
                  label="Updated At"
                  value={formatCleanDateTimeDisplay(detailPatient.updatedAt) || 'Not updated'}
                />
              </DetailSection>
            </div>
          )}

          <DialogFooter className="border-t border-border px-6 pb-6 pt-4 sm:items-center sm:justify-between">
            <div className="text-left text-sm text-muted-foreground">
              <span className="block font-medium text-foreground">Last Updated</span>
              <span>{formatCleanDateTimeDisplay(detailPatient?.updatedAt || detailPatient?.createdAt)}</span>
            </div>
            <Button type="button" onClick={() => setDetailPatient(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Delete the patient record for ${deleteTarget.patientName}? This action cannot be undone.`
                : 'Delete this patient record?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteTarget ? deletingId === deleteTarget.id : false}
            >
              <Trash2 size={17} aria-hidden="true" />
              {deleteTarget && deletingId === deleteTarget.id ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out of this account?</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setLogoutConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmLogout}>
              <LogOut size={17} aria-hidden="true" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function FieldError({ id, message }) {
  if (!message) {
    return null
  }

  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  )
}

function DetailSection({ title, children }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">{title}</h4>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="divide-y divide-border rounded-lg">
        {children}
      </div>
    </section>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
      <span className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
        <Icon size={15} aria-hidden="true" />
        {label}
      </span>
      <span className="break-words text-[15px] font-semibold text-foreground">{value || 'Not provided'}</span>
    </div>
  )
}

function GenderChip({ gender }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      {gender || 'Not provided'}
    </span>
  )
}

function validateLoginForm(credentials) {
  const errors = {}

  if (!credentials.username.trim()) {
    errors.username = 'Username is required.'
  }

  if (!credentials.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

function validatePatientForm(patient, existingPatients = [], currentPatientId = null) {
  const errors = {}
  const today = new Date(`${todayDate}T00:00:00`)
  const oldestAllowed = new Date(`${oldestAllowedBirthDate}T00:00:00`)
  const normalizedPatientName = patient.patientName.trim().toLocaleLowerCase('en-PH')
  const normalizedContactNumber = patient.contactNumber.trim()

  if (!patient.patientName.trim()) {
    errors.patientName = 'Patient name is required.'
  } else if (patient.patientName.length > 50) {
    errors.patientName = 'Patient name must be 50 characters or fewer.'
  } else if (!/^\p{L}[\p{L}.]*(?: \p{L}[\p{L}.]*)*$/u.test(patient.patientName)) {
    errors.patientName = 'Use letters, spaces, or periods only. The name must start with a letter.'
  } else if (
    existingPatients.some(
      (existingPatient) =>
        existingPatient.id !== currentPatientId &&
        existingPatient.patientName.trim().toLocaleLowerCase('en-PH') === normalizedPatientName
    )
  ) {
    errors.patientName = 'A patient with this name already exists.'
  }

  if (!patient.birthDate) {
    errors.birthDate = 'Birth date is required.'
  } else {
    const birthDate = new Date(`${patient.birthDate}T00:00:00`)

    if (birthDate > today) {
      errors.birthDate = 'Birth date cannot be in the future.'
    } else if (birthDate < oldestAllowed) {
      errors.birthDate = 'Birth date cannot be more than 120 years ago.'
    }
  }

  if (!['Female', 'Male'].includes(patient.gender)) {
    errors.gender = 'Please select Female or Male.'
  }

  if (!patient.contactNumber) {
    errors.contactNumber = 'Contact number is required.'
  } else if (!/^09/.test(patient.contactNumber)) {
    errors.contactNumber = 'Contact number must start with 09.'
  } else if (!/^09\d{9}$/.test(patient.contactNumber)) {
    errors.contactNumber = 'Contact number must be exactly 11 digits.'
  } else if (
    existingPatients.some(
      (existingPatient) =>
        existingPatient.id !== currentPatientId && existingPatient.contactNumber.trim() === normalizedContactNumber
    )
  ) {
    errors.contactNumber = 'A patient with this contact number already exists.'
  }

  if (!patient.address.trim()) {
    errors.address = 'Address is required.'
  } else if (patient.address.length > 100) {
    errors.address = 'Address must be 100 characters or fewer.'
  } else if (!/^[\p{L}\d., ]+$/u.test(patient.address)) {
    errors.address = 'Address can contain only letters, numbers, spaces, periods, or commas.'
  } else if (!/\p{L}/u.test(patient.address)) {
    errors.address = 'Address must include at least one letter.'
  }

  return errors
}

function formatPatientNameInput(value) {
  const allowedCharacters = Array.from(value)
    .filter((character) => /[\p{L}. ]/u.test(character))
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '')

  const formattedValue = allowedCharacters
    .split(' ')
    .map((word) => {
      const cleanedWord = word.replace(/^\.+/, '')

      if (!cleanedWord) {
        return ''
      }

      let hasCapitalizedFirstLetter = false

      return Array.from(cleanedWord)
        .map((character) => {
          if (!/\p{L}/u.test(character)) {
            return character
          }

          if (!hasCapitalizedFirstLetter) {
            hasCapitalizedFirstLetter = true
            return character.toLocaleUpperCase('en-PH')
          }

          return character.toLocaleLowerCase('en-PH')
        })
        .join('')
    })
    .join(' ')

  return formattedValue.slice(0, 50)
}

function formatAddressInput(value) {
  const allowedCharacters = Array.from(value)
    .filter((character) => /[\p{L}\d., ]/u.test(character))
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '')

  const formattedValue = allowedCharacters
    .split(' ')
    .map((word) => {
      const cleanedWord = word.replace(/^\.+/, '')

      if (!cleanedWord) {
        return ''
      }

      let hasCapitalizedFirstLetter = false

      return Array.from(cleanedWord)
        .map((character) => {
          if (!/\p{L}/u.test(character)) {
            return character
          }

          if (!hasCapitalizedFirstLetter) {
            hasCapitalizedFirstLetter = true
            return character.toLocaleUpperCase('en-PH')
          }

          return character.toLocaleLowerCase('en-PH')
        })
        .join('')
    })
    .join(' ')

  return formattedValue.slice(0, 100)
}

function formatContactNumberInput(value, previousValue) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (!digits) {
    return ''
  }

  if (digits[0] !== '0') {
    return previousValue
  }

  if (digits.length >= 2 && digits[1] !== '9') {
    return previousValue
  }

  return digits
}

function getDateYearsAgo(years) {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  return date
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

function formatLongDateDisplay(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

function formatCleanDateTimeDisplay(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const formattedDate = new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(date)
  const formattedTime = new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)

  return `${formattedDate} - ${formattedTime}`
}

function formatPatientId(id) {
  return `PAT-${String(id).padStart(6, '0')}`
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
