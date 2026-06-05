import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const BASE_URL = 'http://localhost:3000'

export const fetchFilesList = createAsyncThunk('files/fetchList', async (_, { getState }) => {
  const { auth } = getState()
  const res = await fetch(`${BASE_URL}/files/list`, {
    headers: { Accept: 'application/json', Authorization: auth.token }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.files
})

export const fetchFilesData = createAsyncThunk('files/fetchData', async (fileName, { getState }) => {
  const { auth } = getState()
  const url = fileName
    ? `${BASE_URL}/files/data?fileName=${encodeURIComponent(fileName)}`
    : `${BASE_URL}/files/data`
  const res = await fetch(url, {
    headers: { Accept: 'application/json', Authorization: auth.token }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
})

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    list: [],
    data: [],
    selectedFile: '',
    loading: false,
    error: null
  },
  reducers: {
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilesList.fulfilled, (state, action) => {
        state.list = action.payload
      })
      .addCase(fetchFilesData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFilesData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchFilesData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const { setSelectedFile } = filesSlice.actions
export default filesSlice.reducer
