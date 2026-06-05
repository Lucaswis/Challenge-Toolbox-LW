import { validateName, validateToken } from '../utils/validation'

describe('validateName', () => {
  it('returns nameRequired for empty string', () => {
    expect(validateName('')).toBe('nameRequired')
  })

  it('returns nameRequired for whitespace only', () => {
    expect(validateName('   ')).toBe('nameRequired')
  })

  it('returns nameRequired for null', () => {
    expect(validateName(null)).toBe('nameRequired')
  })

  it('returns null for a valid simple name', () => {
    expect(validateName('Lucas')).toBeNull()
  })

  it('returns null for a name with spaces', () => {
    expect(validateName('Lucas Wisgikl')).toBeNull()
  })

  it('returns null for a name with accented characters', () => {
    expect(validateName('María José')).toBeNull()
  })

  it('returns null for a name with hyphen', () => {
    expect(validateName('Anne-Marie')).toBeNull()
  })

  it('returns nameInvalid for a name containing <', () => {
    expect(validateName('Lucas<script>')).toBe('nameInvalid')
  })

  it('returns nameInvalid for a name containing >', () => {
    expect(validateName('Lucas>')).toBe('nameInvalid')
  })

  it('returns nameInvalid for a name containing "', () => {
    expect(validateName('Lucas"')).toBe('nameInvalid')
  })

  it('returns nameInvalid for a name containing &', () => {
    expect(validateName('Lucas&amp;')).toBe('nameInvalid')
  })

  it('returns nameInvalid for a script injection attempt', () => {
    expect(validateName('<script>alert(1)</script>')).toBe('nameInvalid')
  })

  it('returns nameInvalid for a name with numbers', () => {
    expect(validateName('Lucas123')).toBe('nameInvalid')
  })

  it('returns nameInvalid for a name exceeding 50 characters', () => {
    expect(validateName('A'.repeat(51))).toBe('nameInvalid')
  })
})

describe('validateToken', () => {
  it('returns tokenRequired for empty string', () => {
    expect(validateToken('')).toBe('tokenRequired')
  })

  it('returns tokenRequired for whitespace only', () => {
    expect(validateToken('   ')).toBe('tokenRequired')
  })

  it('returns tokenRequired for null', () => {
    expect(validateToken(null)).toBe('tokenRequired')
  })

  it('returns null for the valid API token', () => {
    expect(validateToken('Bearer toolbox-api-key')).toBeNull()
  })

  it('returns null for any valid Bearer token', () => {
    expect(validateToken('Bearer aSuperSecretKey')).toBeNull()
  })

  it('returns tokenInvalid when Bearer prefix is missing', () => {
    expect(validateToken('toolbox-api-key')).toBe('tokenInvalid')
  })

  it('returns tokenInvalid when key part is empty', () => {
    expect(validateToken('Bearer ')).toBe('tokenInvalid')
  })

  it('returns tokenInvalid for a script injection attempt', () => {
    expect(validateToken('Bearer <script>alert(1)</script>')).toBe('tokenInvalid')
  })

  it('returns tokenInvalid when token contains <', () => {
    expect(validateToken('Bearer toolbox<key')).toBe('tokenInvalid')
  })

  it('returns tokenInvalid when token contains "', () => {
    expect(validateToken('Bearer "toolbox-api-key"')).toBe('tokenInvalid')
  })

  it('returns tokenInvalid for javascript: injection', () => {
    expect(validateToken('Bearer javascript:alert(1)')).toBe('tokenInvalid')
  })
})
