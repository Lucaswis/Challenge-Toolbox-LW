import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const STORAGE_KEY = 'toolbox_auth'
const SESSION_NAME_KEY = 'toolbox_session_name'
const BASE_URL = 'http://localhost:3000'

function loadFromStorage () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function loadSessionName () {
  try { return sessionStorage.getItem(SESSION_NAME_KEY) || '' } catch { return '' }
}

const saved = loadFromStorage()
const sessionName = loadSessionName()
const sessionExpired = !saved?.isLoggedIn && !!sessionName

export const loginUser = createAsyncThunk('auth/loginUser', async ({ name, token }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE_URL}/files/list`, {
      headers: { Accept: 'application/json', Authorization: token }
    })
    if (res.status === 401) return rejectWithValue('invalidCredentials')
    if (!res.ok) return rejectWithValue('networkError')
    return { name, token }
  } catch {
    return rejectWithValue('networkError')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    name: saved?.name || '',
    token: saved?.token || '',
    isLoggedIn: !!(saved?.isLoggedIn && saved?.token),
    loginLoading: false,
    loginError: null,
    sessionExpired,
    lastLoginName: sessionName
  },
  reducers: {
    logout: (state) => {
      state.name = ''
      state.token = ''
      state.isLoggedIn = false
      state.loginError = null
      state.sessionExpired = false
      state.lastLoginName = ''
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(SESSION_NAME_KEY)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true
        state.loginError = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { name, token } = action.payload
        state.loginLoading = false
        state.name = name
        state.token = token
        state.isLoggedIn = true
        state.loginError = null
        state.sessionExpired = false
        state.lastLoginName = name
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, token, isLoggedIn: true }))
        sessionStorage.setItem(SESSION_NAME_KEY, name)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false
        state.loginError = action.payload || 'loginFailed'
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
