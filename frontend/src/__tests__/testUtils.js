import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '../store/uiSlice'
import authReducer from '../store/authSlice'

const defaultAuth = {
  name: '',
  token: '',
  isLoggedIn: false,
  loginLoading: false,
  loginError: null,
  sessionExpired: false,
  lastLoginName: ''
}

export function renderWithStore (ui, { language = 'en', auth = {} } = {}) {
  const store = configureStore({
    reducer: { ui: uiReducer, auth: authReducer },
    preloadedState: {
      ui: { darkMode: false, language },
      auth: { ...defaultAuth, ...auth }
    }
  })
  return render(<Provider store={store}>{ui}</Provider>)
}
