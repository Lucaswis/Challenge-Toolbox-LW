const INJECTION_CHARS = /[<>"&]/
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'\-]{1,50}$/
const TOKEN_REGEX = /^Bearer [a-zA-Z0-9_-]{1,100}$/

export function validateName (value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return 'nameRequired'
  if (INJECTION_CHARS.test(trimmed)) return 'nameInvalid'
  if (!NAME_REGEX.test(trimmed)) return 'nameInvalid'
  return null
}

export function validateToken (value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return 'tokenRequired'
  if (INJECTION_CHARS.test(trimmed)) return 'tokenInvalid'
  if (!TOKEN_REGEX.test(trimmed)) return 'tokenInvalid'
  return null
}
