const { API_KEY } = require('../config')
const { UNAUTHORIZED } = require('../errors')

function auth (req, res, next) {
  const authHeader = req.headers.authorization

  if (authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: UNAUTHORIZED })
  }

  next()
}

module.exports = auth
