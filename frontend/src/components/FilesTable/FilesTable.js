import { Table, Spinner, Alert } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'

function FilesTable ({ data, loading, error }) {
  const t = useTranslation()

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </Spinner>
      </div>
    )
  }

  if (error) {
    return <Alert variant="danger" className="mt-3">{t('errorPrefix')}: {error}</Alert>
  }

  const rows = data.flatMap((file) =>
    file.lines.map((line, index) => ({
      id: `${file.file}-${index}`,
      file: file.file,
      text: line.text,
      number: line.number,
      hex: line.hex
    }))
  )

  if (rows.length === 0) {
    return <Alert variant="info" className="mt-3">{t('noData')}</Alert>
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>{t('fileName')}</th>
          <th>{t('text')}</th>
          <th>{t('number')}</th>
          <th>{t('hex')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.file}</td>
            <td>{row.text}</td>
            <td>{row.number}</td>
            <td>{row.hex}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default FilesTable
