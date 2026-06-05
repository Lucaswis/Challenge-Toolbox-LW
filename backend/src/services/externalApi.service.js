const https = require('https')

const HOSTNAME = 'echo-serv.tbxnet.com'
const API_KEY = 'Bearer aSuperSecretKey'

function get (path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOSTNAME,
      path,
      headers: { authorization: API_KEY }
    }

    https
      .get(options, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode} on ${path}`))
          }
          resolve(data)
        })
      })
      .on('error', reject)
  })
}

async function listFiles () {
  const raw = await get('/v1/secret/files')
  return JSON.parse(raw).files
}

function downloadFile (filename) {
  return get(`/v1/secret/file/${filename}`)
}

module.exports = { listFiles, downloadFile }
