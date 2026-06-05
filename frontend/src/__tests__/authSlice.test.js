import authReducer, { logout, loginUser } from '../store/authSlice'

const initialState = {
  name: '',
  token: '',
  isLoggedIn: false,
  loginLoading: false,
  loginError: null,
  sessionExpired: false,
  lastLoginName: ''
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('authSlice', () => {
  describe('reducer — logout', () => {
    it('clears user data and errors', () => {
      const loggedIn = {
        ...initialState,
        name: 'Lucas',
        token: 'Bearer toolbox-api-key',
        isLoggedIn: true,
        lastLoginName: 'Lucas'
      }
      const state = authReducer(loggedIn, logout())
      expect(state.isLoggedIn).toBe(false)
      expect(state.name).toBe('')
      expect(state.token).toBe('')
      expect(state.loginError).toBeNull()
    })

    it('removes auth from localStorage', () => {
      localStorage.setItem('toolbox_auth', JSON.stringify({ name: 'Lucas', token: 'Bearer t', isLoggedIn: true }))
      authReducer({ ...initialState, isLoggedIn: true }, logout())
      expect(localStorage.getItem('toolbox_auth')).toBeNull()
    })

    it('removes name from sessionStorage', () => {
      sessionStorage.setItem('toolbox_session_name', 'Lucas')
      authReducer({ ...initialState, lastLoginName: 'Lucas' }, logout())
      expect(sessionStorage.getItem('toolbox_session_name')).toBeNull()
    })
  })

  describe('reducer — loginUser.pending', () => {
    it('sets loginLoading to true', () => {
      const state = authReducer(initialState, loginUser.pending())
      expect(state.loginLoading).toBe(true)
    })

    it('clears a previous loginError', () => {
      const state = authReducer(
        { ...initialState, loginError: 'invalidCredentials' },
        loginUser.pending()
      )
      expect(state.loginError).toBeNull()
    })
  })

  describe('reducer — loginUser.fulfilled', () => {
    it('sets isLoggedIn and user data', () => {
      const state = authReducer(
        { ...initialState, loginLoading: true },
        loginUser.fulfilled({ name: 'Lucas', token: 'Bearer toolbox-api-key' })
      )
      expect(state.isLoggedIn).toBe(true)
      expect(state.name).toBe('Lucas')
      expect(state.token).toBe('Bearer toolbox-api-key')
      expect(state.loginLoading).toBe(false)
      expect(state.loginError).toBeNull()
    })

    it('clears sessionExpired', () => {
      const state = authReducer(
        { ...initialState, sessionExpired: true },
        loginUser.fulfilled({ name: 'Lucas', token: 'Bearer toolbox-api-key' })
      )
      expect(state.sessionExpired).toBe(false)
    })

    it('persists auth to localStorage', () => {
      authReducer(initialState, loginUser.fulfilled({ name: 'Lucas', token: 'Bearer toolbox-api-key' }))
      const saved = JSON.parse(localStorage.getItem('toolbox_auth'))
      expect(saved.isLoggedIn).toBe(true)
      expect(saved.name).toBe('Lucas')
      expect(saved.token).toBe('Bearer toolbox-api-key')
    })

    it('persists name to sessionStorage', () => {
      authReducer(initialState, loginUser.fulfilled({ name: 'Lucas', token: 'Bearer toolbox-api-key' }))
      expect(sessionStorage.getItem('toolbox_session_name')).toBe('Lucas')
    })
  })

  describe('reducer — loginUser.rejected', () => {
    it('sets loginError to invalidCredentials', () => {
      const state = authReducer(
        { ...initialState, loginLoading: true },
        loginUser.rejected(null, '', {}, 'invalidCredentials')
      )
      expect(state.loginLoading).toBe(false)
      expect(state.loginError).toBe('invalidCredentials')
    })

    it('sets loginError to networkError', () => {
      const state = authReducer(
        { ...initialState, loginLoading: true },
        loginUser.rejected(null, '', {}, 'networkError')
      )
      expect(state.loginError).toBe('networkError')
    })

    it('falls back to loginFailed when payload is missing', () => {
      const state = authReducer(
        { ...initialState, loginLoading: true },
        loginUser.rejected(null, '', {})
      )
      expect(state.loginError).toBe('loginFailed')
    })
  })
})
