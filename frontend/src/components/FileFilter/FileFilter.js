import { Form } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'

function FileFilter ({ fileList, selectedFile, onChange }) {
  const t = useTranslation()

  return (
    <Form.Select
      className="mb-3"
      value={selectedFile}
      onChange={(e) => onChange(e.target.value)}
      aria-label={t('allFiles')}
    >
      <option value="">{t('allFiles')}</option>
      {fileList.map((file) => (
        <option key={file} value={file}>{file}</option>
      ))}
    </Form.Select>
  )
}

export default FileFilter
