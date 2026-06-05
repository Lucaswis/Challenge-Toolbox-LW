import { configureStore } from '@reduxjs/toolkit'
import filesReducer from './filesSlice'
import uiReducer from './uiSlice'
import authReducer from './authSlice'

export default configureStore({
  reducer: {
    files: filesReducer,
    ui: uiReducer,
    auth: authReducer
  }
})
