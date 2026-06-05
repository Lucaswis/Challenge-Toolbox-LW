import { Form, Row, Col } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'

const sanitizers = {
  text: (v) => v.replace(/[<>"'&;]/g, ''),
  number: (v) => v.replace(/\D/g, ''),
  hex: (v) => v.replace(/[^0-9a-fA-F]/g, '')
}

function TableFilters ({ filters, onChange }) {
  const t = useTranslation()

  const handleChange = (field, value) => {
    onChange(field, sanitizers[field](value))
  }

  return (
    <Row className="mb-3 g-2">
      <Col>
        <Form.Control
          placeholder={t('text')}
          value={filters.text}
          maxLength={100}
          onChange={(e) => handleChange('text', e.target.value)}
        />
      </Col>
      <Col>
        <Form.Control
          placeholder={t('number')}
          value={filters.number}
          maxLength={20}
          onChange={(e) => handleChange('number', e.target.value)}
        />
      </Col>
      <Col>
        <Form.Control
          placeholder={t('hex')}
          value={filters.hex}
          maxLength={32}
          onChange={(e) => handleChange('hex', e.target.value)}
        />
      </Col>
    </Row>
  )
}

export default TableFilters
