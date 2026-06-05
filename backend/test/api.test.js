const http = require('http')
const { expect } = require('chai')
const createApp = require('../src/app')
const { API_KEY } = require('../src/config')

const MOCK_DATA = [
  {
    file: 'file1.csv',
    lines: [{ text: 'RgTya', number: 64075909, hex: '70ad29aacf0b690b0467fe2b2767f765' }]
  }
]

const AUTH_HEADER = { authorization: `Bearer ${API_KEY}` }

function startServer (filesService) {
  return new Promise((resolve) => {
    const app = createApp({ filesService })
    const server = http.createServer(app)
    server.listen(0, () => resolve(server))
  })
}

function stopServer (server) {
  return new Promise((resolve) => server.close(resolve))
}

function get (port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    http
      .get({ hostname: 'localhost', port, path, headers }, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () =>
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) })
        )
      })
      .on('error', reject)
  })
}

describe('GET /files/list', () => {
  let server
  let port

  before(async () => {
    server = await startServer({
      listFiles: async () => ({ files: ['file1.csv', 'file2.csv'] }),
      getFilesData: async () => MOCK_DATA
    })
    port = server.address().port
  })

  after(() => stopServer(server))

  it('returns 200 with the list of files', async () => {
    const { statusCode, body } = await get(port, '/files/list', AUTH_HEADER)
    expect(statusCode).to.equal(200)
    expect(body).to.deep.equal({ files: ['file1.csv', 'file2.csv'] })
  })
})

describe('GET /files/data', () => {
  let server
  let port

  before(async () => {
    server = await startServer({
      listFiles: async () => ({ files: [] }),
      getFilesData: async () => MOCK_DATA
    })
    port = server.address().port
  })

  after(() => stopServer(server))

  it('returns 200 with the formatted files data', async () => {
    const { statusCode, body } = await get(port, '/files/data', AUTH_HEADER)
    expect(statusCode).to.equal(200)
    expect(body).to.deep.equal(MOCK_DATA)
  })

  it('passes fileName query param to the service', async () => {
    const { statusCode, body } = await get(port, '/files/data?fileName=file1.csv', AUTH_HEADER)
    expect(statusCode).to.equal(200)
    expect(body).to.deep.equal(MOCK_DATA)
  })

  it('returns 500 when the service throws', async () => {
    const errorServer = await startServer({
      listFiles: async () => ({ files: [] }),
      getFilesData: async () => { throw new Error('Service failure') }
    })
    const errorPort = errorServer.address().port

    const { statusCode } = await get(errorPort, '/files/data', AUTH_HEADER)

    expect(statusCode).to.equal(500)
    await stopServer(errorServer)
  })

  it('returns 400 when fileName does not have a .csv extension', async () => {
    const { statusCode, body } = await get(port, '/files/data?fileName=malicious.exe', AUTH_HEADER)
    expect(statusCode).to.equal(400)
    expect(body).to.have.property('error')
  })

  it('returns 400 when fileName contains path traversal characters', async () => {
    const { statusCode, body } = await get(port, '/files/data?fileName=../etc/passwd', AUTH_HEADER)
    expect(statusCode).to.equal(400)
    expect(body).to.have.property('error')
  })

  it('returns 200 when fileName is a valid .csv filename', async () => {
    const { statusCode } = await get(port, '/files/data?fileName=file1.csv', AUTH_HEADER)
    expect(statusCode).to.equal(200)
  })
})
