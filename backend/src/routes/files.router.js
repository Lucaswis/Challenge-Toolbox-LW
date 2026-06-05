const express = require('express')
const validateFileName = require('../middleware/validateFileName.middleware')
const { FAILED_LIST, FAILED_DATA } = require('../errors')

function create (filesService) {
  const router = express.Router()

  router.get('/list', async (req, res) => {
    try {
      const data = await filesService.listFiles()
      res.json(data)
    } catch (err) {
      res.status(500).json({ error: FAILED_LIST })
    }
  })

  router.get('/data', validateFileName, async (req, res) => {
    try {
      const { fileName } = req.query
      const data = await filesService.getFilesData(fileName)
      res.json(data)
    } catch (err) {
      res.status(500).json({ error: FAILED_DATA })
    }
  })

  return router
}

module.exports = { create }
