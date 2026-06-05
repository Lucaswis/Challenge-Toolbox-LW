import filesReducer, {
  setSelectedFile,
  fetchFilesData,
  fetchFilesList
} from './filesSlice'

const initialState = {
  list: [],
  data: [],
  selectedFile: '',
  loading: false,
  error: null
}

describe('filesSlice', () => {
  describe('reducer', () => {
    it('returns the initial state', () => {
      expect(filesReducer(undefined, { type: '@@init' })).toEqual(initialState)
    })

    it('setSelectedFile updates selectedFile', () => {
      const state = filesReducer(initialState, setSelectedFile('file1.csv'))
      expect(state.selectedFile).toBe('file1.csv')
    })

    it('fetchFilesData.pending sets loading to true and clears error', () => {
      const state = filesReducer(
        { ...initialState, error: 'previous error' },
        fetchFilesData.pending()
      )
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('fetchFilesData.fulfilled sets data and loading to false', () => {
      const payload = [{ file: 'file1.csv', lines: [] }]
      const state = filesReducer(
        { ...initialState, loading: true },
        fetchFilesData.fulfilled(payload)
      )
      expect(state.loading).toBe(false)
      expect(state.data).toEqual(payload)
    })

    it('fetchFilesData.rejected sets error and loading to false', () => {
      const state = filesReducer(
        { ...initialState, loading: true },
        fetchFilesData.rejected(new Error('Network error'), '')
      )
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Network error')
    })

    it('fetchFilesList.fulfilled sets the file list', () => {
      const payload = ['file1.csv', 'file2.csv']
      const state = filesReducer(initialState, fetchFilesList.fulfilled(payload))
      expect(state.list).toEqual(payload)
    })
  })
})
