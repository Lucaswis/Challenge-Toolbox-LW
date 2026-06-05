import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { loginUser } from '../../store/authSlice'
import { useTranslation } from '../../hooks/useTranslation'
import { validateName, validateToken } from '../../utils/validation'

function Login () {
  const [name, setName] = useState('')
  const [token, setToken] = useState('')
  const [nameError, setNameError] = useState(null)
  const [tokenError, setTokenError] = useState(null)
  const dispatch = useDispatch()
  const { loginError, loginLoading, sessionExpired, lastLoginName } = useSelector((state) => state.auth)
  const t = useTranslation()

  const handleSubmit = (e) => {
    e.preventDefault()
    const nameErr = validateName(name)
    const tokenErr = validateToken(token)
    setNameError(nameErr)
    setTokenError(tokenErr)
    if (nameErr || tokenErr) return
    dispatch(loginUser({ name: name.trim(), token: token.trim() }))
  }

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      <Card style={{ width: '420px' }}>
        <Card.Body className="p-4">
          <Card.Title className="text-center mb-4 fs-4">
            {t('loginTitle')}
          </Card.Title>

          {sessionExpired && (
            <Alert variant="warning" className="mb-3">
              {lastLoginName && <strong>{t('hello')}, {lastLoginName}. </strong>}
              {t('sessionExpired')}
            </Alert>
          )}

          {loginError && (
            <Alert variant="danger" className="mb-3">
              {t(loginError)}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>{t('nameLabel')}</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(null) }}
                placeholder={t('namePlaceholder')}
                isInvalid={!!nameError}
                disabled={loginLoading}
              />
              <Form.Control.Feedback type="invalid">
                {nameError && t(nameError)}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>{t('authLabel')}</Form.Label>
              <Form.Control
                type="text"
                value={token}
                onChange={(e) => { setToken(e.target.value); setTokenError(null) }}
                placeholder="Bearer toolbox-api-key"
                isInvalid={!!tokenError}
                disabled={loginLoading}
              />
              <Form.Control.Feedback type="invalid">
                {tokenError && t(tokenError)}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Text className="text-muted d-block mb-3">
              {t('authHint')}: <code>Bearer toolbox-api-key</code>
            </Form.Text>
            <Button
              type="submit"
              variant="danger"
              className="w-100 mt-1"
              disabled={loginLoading}
            >
              {loginLoading
                ? <Spinner animation="border" size="sm" />
                : t('loginButton')}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Login
