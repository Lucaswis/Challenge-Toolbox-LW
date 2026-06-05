import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileFilter from '../components/FileFilter'
import { renderWithStore } from './testUtils'

describe('FileFilter', () => {
  it('renders "All files" as the default option', () => {
    renderWithStore(<FileFilter fileList={[]} selectedFile="" onChange={() => {}} />)
    expect(screen.getByText('All files')).toBeInTheDocument()
  })

  it('renders an option for each file in the list', () => {
    const files = ['file1.csv', 'file2.csv']
    renderWithStore(<FileFilter fileList={files} selectedFile="" onChange={() => {}} />)
    expect(screen.getByText('file1.csv')).toBeInTheDocument()
    expect(screen.getByText('file2.csv')).toBeInTheDocument()
  })

  it('calls onChange with the selected file name', async () => {
    const handleChange = jest.fn()
    renderWithStore(
      <FileFilter
        fileList={['file1.csv', 'file2.csv']}
        selectedFile=""
        onChange={handleChange}
      />
    )
    await userEvent.selectOptions(screen.getByRole('combobox'), 'file1.csv')
    expect(handleChange).toHaveBeenCalledWith('file1.csv')
  })

  it('calls onChange with empty string when "All files" is selected', async () => {
    const handleChange = jest.fn()
    renderWithStore(
      <FileFilter
        fileList={['file1.csv']}
        selectedFile="file1.csv"
        onChange={handleChange}
      />
    )
    await userEvent.selectOptions(screen.getByRole('combobox'), '')
    expect(handleChange).toHaveBeenCalledWith('')
  })

  it('renders translated option label in Spanish', () => {
    renderWithStore(
      <FileFilter fileList={[]} selectedFile="" onChange={() => {}} />,
      { language: 'es' }
    )
    expect(screen.getByText('Todos los archivos')).toBeInTheDocument()
  })
})
