import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import FilesTable from '../components/FilesTable'
import { renderWithStore } from './testUtils'

const MOCK_DATA = [
  {
    file: 'file1.csv',
    lines: [
      { text: 'RgTya', number: 64075909, hex: '70ad29aacf0b690b0467fe2b2767f765' }
    ]
  }
]

describe('FilesTable', () => {
  it('renders a spinner when loading', () => {
    renderWithStore(<FilesTable data={[]} loading error={null} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders an error message when error is provided', () => {
    renderWithStore(<FilesTable data={[]} loading={false} error="Something went wrong" />)
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
  })

  it('renders "No data available" when data is empty', () => {
    renderWithStore(<FilesTable data={[]} loading={false} error={null} />)
    expect(screen.getByText(/No data available/)).toBeInTheDocument()
  })

  it('renders a row for each line in the data', () => {
    renderWithStore(<FilesTable data={MOCK_DATA} loading={false} error={null} />)
    expect(screen.getByText('file1.csv')).toBeInTheDocument()
    expect(screen.getByText('RgTya')).toBeInTheDocument()
    expect(screen.getByText('64075909')).toBeInTheDocument()
    expect(screen.getByText('70ad29aacf0b690b0467fe2b2767f765')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    renderWithStore(<FilesTable data={MOCK_DATA} loading={false} error={null} />)
    expect(screen.getByText('File Name')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Number')).toBeInTheDocument()
    expect(screen.getByText('Hex')).toBeInTheDocument()
  })

  it('flattens lines from multiple files into separate rows', () => {
    const data = [
      { file: 'a.csv', lines: [{ text: 'foo', number: 1, hex: 'a'.repeat(32) }] },
      { file: 'b.csv', lines: [{ text: 'bar', number: 2, hex: 'b'.repeat(32) }] }
    ]
    renderWithStore(<FilesTable data={data} loading={false} error={null} />)
    expect(screen.getByText('a.csv')).toBeInTheDocument()
    expect(screen.getByText('b.csv')).toBeInTheDocument()
  })

  it('renders translated headers in Spanish', () => {
    renderWithStore(
      <FilesTable data={MOCK_DATA} loading={false} error={null} />,
      { language: 'es' }
    )
    expect(screen.getByText('Nombre de archivo')).toBeInTheDocument()
    expect(screen.getByText('Texto')).toBeInTheDocument()
  })
})
