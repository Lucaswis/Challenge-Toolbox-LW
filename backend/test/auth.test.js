const http = require('http')
const { expect } = require('chai')
const createApp = require('../src/app')
const { API_KEY } = require('../src/config')

function startServer () {
  return new Promise((resolve) => {
    const app = createApp({
      filesService: {
        listFiles: async () => ({ files: [] }),
        getFilesData: async () => []
      }
    })
    const server = http.createServer(app)
    server.listen(0, () => resolve(server))
  })
}

function stopServer (server) {
  return new Promise((resolve) => server.close(resolve))
}

function get (port, headers = {}) {
  return new Promise((resolve, reject) => {
    http
      .get({ hostname: 'localhost', port, path: '/files/data', headers }, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () =>
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) })
        )
      })
      .on('error', reject)
  })
}

describe('Auth middleware', () => {
  let server
  let port

  before(async () => {
    server = await startServer()
    port = server.address().port
  })

  after(() => stopServer(server))

  it('returns 401 when the Authorization header is missing', async () => {
    const { statusCode, body } = await get(port)
    expect(statusCode).to.equal(401)
    expect(body).to.have.property('error')
  })

  it('returns 401 when the API key is incorrect', async () => {
    const { statusCode } = await get(port, { authorization: 'Bearer wrong-key' })
    expect(statusCode).to.equal(401)
  })

  it('returns 401 when the Bearer prefix is missing', async () => {
    const { statusCode } = await get(port, { authorization: API_KEY })
    expect(statusCode).to.equal(401)
  })

  it('returns 200 when the correct API key is provided', async () => {
    const { statusCode } = await get(port, { authorization: `Bearer ${API_KEY}` })
    expect(statusCode).to.equal(200)
  })
})
