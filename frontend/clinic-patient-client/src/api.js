const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5088/api'
const TOKEN_KEY = 'clinic_patient_token'
const USERNAME_KEY = 'clinic_patient_username'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY)
}

export function saveSession({ token, username }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
}

async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  })

  if (response.status === 401) {
    clearSession()
    const error = new Error('Your session has expired. Please log in again.')
    error.status = 401
    throw error
  }

  if (!response.ok) {
    let message = 'Request failed. Please try again.'
    try {
      const data = await response.json()
      message = data.message || data.title || message
    } catch {
      message = response.statusText || message
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export async function login(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' })
  } finally {
    clearSession()
  }
}

export function getPatients() {
  return apiRequest('/patients')
}

export function createPatient(patient) {
  return apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(patient)
  })
}

export function updatePatient(id, patient) {
  return apiRequest(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patient)
  })
}

export function deletePatient(id) {
  return apiRequest(`/patients/${id}`, {
    method: 'DELETE'
  })
}
