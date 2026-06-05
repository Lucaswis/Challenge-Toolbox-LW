import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../components/Login/Login'
import { renderWithStore } from './testUtils'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  global.fetch = jest.fn()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('Login', () => {
  describe('rendering', () => {
    it('renders the name and authorization fields', () => {
      renderWithStore(<Login />)
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Bearer toolbox-api-key')).toBeInTheDocument()
    })

    it('renders the API key hint', () => {
      renderWithStore(<Login />)
      expect(screen.getByText(/Bearer toolbox-api-key/)).toBeInTheDocument()
    })

    it('renders the submit button', () => {
      renderWithStore(<Login />)
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })
  })

  describe('session expired alert', () => {
    it('shows the session expired message when sessionExpired is true', () => {
      renderWithStore(<Login />, { auth: { sessionExpired: true, lastLoginName: '' } })
      expect(screen.getByText(/session was removed/i)).toBeInTheDocument()
    })

    it('includes the user name in the session expired message', () => {
      renderWithStore(<Login />, { auth: { sessionExpired: true, lastLoginName: 'Lucas' } })
      expect(screen.getByText(/Lucas/)).toBeInTheDocument()
      expect(screen.getByText(/session was removed/i)).toBeInTheDocument()
    })

    it('does not show session expired when sessionExpired is false', () => {
      renderWithStore(<Login />)
      expect(screen.queryByText(/session was removed/i)).not.toBeInTheDocument()
    })
  })

  describe('login error alert', () => {
    it('shows invalid credentials error from the store', () => {
      renderWithStore(<Login />, { auth: { loginError: 'invalidCredentials' } })
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    it('shows network error from the store', () => {
      renderWithStore(<Login />, { auth: { loginError: 'networkError' } })
      expect(screen.getByText(/could not connect/i)).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('shows error when name is empty on submit', async () => {
      renderWithStore(<Login />)
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })

    it('shows error when name contains injection characters', async () => {
      renderWithStore(<Login />)
      await userEvent.type(screen.getByPlaceholderText('Your name'), '<script>alert(1)</script>')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      expect(screen.getByText(/can only contain letters/i)).toBeInTheDocument()
    })

    it('shows error when token is empty on submit', async () => {
      renderWithStore(<Login />)
      await userEvent.type(screen.getByPlaceholderText('Your name'), 'Lucas')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      expect(screen.getByText(/authorization is required/i)).toBeInTheDocument()
    })

    it('shows error when token has invalid format', async () => {
      renderWithStore(<Login />)
      await userEvent.type(screen.getByPlaceholderText('Your name'), 'Lucas')
      await userEvent.type(screen.getByPlaceholderText('Bearer toolbox-api-key'), 'wrong-format')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      expect(screen.getByText(/must follow the format/i)).toBeInTheDocument()
    })

    it('clears name error when user starts typing', async () => {
      renderWithStore(<Login />)
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      await userEvent.type(screen.getByPlaceholderText('Your name'), 'L')
      expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('calls the API with the provided token on valid submit', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ files: [] }) })
      renderWithStore(<Login />)
      await userEvent.type(screen.getByPlaceholderText('Your name'), 'Lucas')
      await userEvent.type(screen.getByPlaceholderText('Bearer toolbox-api-key'), 'Bearer toolbox-api-key')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/files/list',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer toolbox-api-key' })
        })
      )
    })

    it('persists auth to localStorage after successful login', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ files: [] }) })
      renderWithStore(<Login />)
      await userEvent.type(screen.getByPlaceholderText('Your name'), 'Lucas')
      await userEvent.type(screen.getByPlaceholderText('Bearer toolbox-api-key'), 'Bearer toolbox-api-key')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      await waitFor(() => {
        const saved = JSON.parse(localStorage.getItem('toolbox_auth'))
        expect(saved?.isLoggedIn).toBe(true)
        expect(saved?.name).toBe('Lucas')
      })
    })

    it('shows invalid credentials error when API returns 401', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 401 })
      renderWithStore(<Login />)
      await userEvent.type(screen.getByPlaceholderText('Your name'), 'Lucas')
      await userEvent.type(screen.getByPlaceholderText('Bearer toolbox-api-key'), 'Bearer wrong-key')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('shows network error when fetch throws', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network failure'))
      renderWithStore(<Login />)
      await userEvent.type(screen.getByPlaceholderText('Your name'), 'Lucas')
      await userEvent.type(screen.getByPlaceholderText('Bearer toolbox-api-key'), 'Bearer toolbox-api-key')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      await waitFor(() => {
        expect(screen.getByText(/could not connect/i)).toBeInTheDocument()
      })
    })
  })
})
