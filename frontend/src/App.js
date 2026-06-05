import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Navbar, Button } from 'react-bootstrap'
import { fetchFilesList, fetchFilesData, setSelectedFile, setFilter } from './store/filesSlice'
import { toggleTheme, toggleLanguage } from './store/uiSlice'
import { logout } from './store/authSlice'
import { useTranslation } from './hooks/useTranslation'
import Login from './components/Login/Login'
import FileFilter from './components/FileFilter/FileFilter'
import TableFilters from './components/TableFilters/TableFilters'
import FilesTable from './components/FilesTable/FilesTable'
import Footer from './components/Footer/Footer'
import 'bootstrap/dist/css/bootstrap.min.css'

function App () {
  const dispatch = useDispatch()
  const { list, data, selectedFile, loading, error, filters } = useSelector((state) => state.files)
  const { darkMode } = useSelector((state) => state.ui)
  const { isLoggedIn, name } = useSelector((state) => state.auth)
  const t = useTranslation()

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchFilesList())
      dispatch(fetchFilesData())
    }
  }, [dispatch, isLoggedIn])

  const handleFileChange = (fileName) => {
    dispatch(setSelectedFile(fileName))
    dispatch(fetchFilesData(fileName || undefined))
  }

  const handleFilterChange = (field, value) => {
    dispatch(setFilter({ field, value }))
  }

  const filteredData = data.map((file) => ({
    ...file,
    lines: file.lines.filter((line) =>
      line.text.toLowerCase().includes(filters.text.toLowerCase()) &&
      String(line.number).includes(filters.number) &&
      line.hex.toLowerCase().includes(filters.hex.toLowerCase())
    )
  })).filter((file) => file.lines.length > 0)

  if (!isLoggedIn) {
    return <Login />
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar style={{ backgroundColor: darkMode ? '#9e2c2c' : '#e05252' }}>
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand style={{ color: '#fff', fontWeight: 'bold' }}>
            {t('hello')}, {name}
          </Navbar.Brand>
          <div className="d-flex gap-2">
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => dispatch(toggleTheme())}
            >
              {darkMode ? t('toggleLight') : t('toggleDark')}
            </Button>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => dispatch(toggleLanguage())}
            >
              {t('langToggle')}
            </Button>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => dispatch(logout())}
            >
              {t('logout')}
            </Button>
          </div>
        </Container>
      </Navbar>
      <Container className="mt-4 flex-grow-1">
        <FileFilter
          fileList={list}
          selectedFile={selectedFile}
          onChange={handleFileChange}
        />
        <TableFilters filters={filters} onChange={handleFilterChange} />
        <FilesTable data={filteredData} loading={loading} error={error} />
      </Container>
      <Footer />
    </div>
  )
}

export default App
