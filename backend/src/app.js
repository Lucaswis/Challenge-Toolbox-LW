const express = require('express')
const path = require('path')
const filesRouter = require('./routes/files.router')
const defaultFilesService = require('./services/files.service')
const cors = require('./middleware/cors.middleware')
const auth = require('./middleware/auth.middleware')

const swaggerHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Challenge Toolbox API</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function () {
        SwaggerUIBundle({
          url: '/api-docs/openapi.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: 'BaseLayout'
        })
      }
    </script>
  </body>
</html>`

function createApp (deps = {}) {
  const filesService = deps.filesService || defaultFilesService
  const app = express()

  app.use(express.json())
  app.use(cors)

  app.get('/api-docs/openapi.json', (req, res) => {
    res.json(require('./openapi.json'))
  })

  app.get('/api-docs', (req, res) => {
    res.send(swaggerHtml)
  })

  app.use(auth)
  app.use('/files', filesRouter.create(filesService))

  return app
}

module.exports = createApp
