import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: { darkMode: false, language: 'en' },
  reducers: {
    toggleTheme: (state) => { state.darkMode = !state.darkMode },
    toggleLanguage: (state) => {
      state.language = state.language === 'en' ? 'es' : 'en'
    }
  }
})

export const { toggleTheme, toggleLanguage } = uiSlice.actions
export default uiSlice.reducer
