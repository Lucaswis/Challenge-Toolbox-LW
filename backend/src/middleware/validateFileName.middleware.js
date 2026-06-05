const { INVALID_FILENAME } = require('../errors')

const CSV_FILENAME_REGEX = /^[a-zA-Z0-9._-]+\.csv$/

function validateFileName (req, res, next) {
  const { fileName } = req.query
  if (fileName !== undefined && !CSV_FILENAME_REGEX.test(fileName)) {
    return res.status(400).json({ error: INVALID_FILENAME })
  }
  next()
}

module.exports = validateFileName
