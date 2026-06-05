const { expect } = require('chai')
const { getFilesData, listFiles } = require('../src/services/files.service')

const VALID_CSV =
  'file,text,number,hex\nfile1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765'

const EXPECTED_LINE = {
  text: 'RgTya',
  number: 64075909,
  hex: '70ad29aacf0b690b0467fe2b2767f765'
}

describe('listFiles', () => {
  it('returns the file list from the external API', async () => {
    const mockApi = {
      listFiles: async () => ['file1.csv', 'file2.csv']
    }

    const result = await listFiles(mockApi)

    expect(result).to.deep.equal({ files: ['file1.csv', 'file2.csv'] })
  })
})

describe('getFilesData', () => {
  it('returns formatted data for all files', async () => {
    const mockApi = {
      listFiles: async () => ['file1.csv'],
      downloadFile: async () => VALID_CSV
    }

    const result = await getFilesData(null, mockApi)

    expect(result).to.deep.equal([{ file: 'file1.csv', lines: [EXPECTED_LINE] }])
  })

  it('filters by fileName when provided', async () => {
    const mockApi = {
      listFiles: async () => ['file1.csv', 'file2.csv'],
      downloadFile: async (filename) =>
        `file,text,number,hex\n${filename},Hello,42,aaaabbbbccccddddaaaabbbbccccdddd`
    }

    const result = await getFilesData('file2.csv', mockApi)

    expect(result).to.have.length(1)
    expect(result[0].file).to.equal('file2.csv')
  })

  it('returns empty array when fileName does not match any file', async () => {
    const mockApi = {
      listFiles: async () => ['file1.csv'],
      downloadFile: async () => VALID_CSV
    }

    const result = await getFilesData('nonexistent.csv', mockApi)

    expect(result).to.have.lengthOf(0)
  })

  it('includes failed files with empty lines and an error message', async () => {
    const mockApi = {
      listFiles: async () => ['file1.csv', 'broken.csv'],
      downloadFile: async (filename) => {
        if (filename === 'broken.csv') throw new Error('HTTP 404 on /v1/secret/file/broken.csv')
        return VALID_CSV
      }
    }

    const result = await getFilesData(null, mockApi)

    expect(result).to.have.length(2)
    expect(result[0]).to.deep.equal({ file: 'file1.csv', lines: [EXPECTED_LINE] })
    expect(result[1].file).to.equal('broken.csv')
    expect(result[1].lines).to.have.lengthOf(0)
    expect(result[1].error).to.equal('HTTP 404 on /v1/secret/file/broken.csv')
  })

  it('includes files with no valid lines as empty lines array', async () => {
    const mockApi = {
      listFiles: async () => ['empty.csv'],
      downloadFile: async () => 'file,text,number,hex'
    }

    const result = await getFilesData(null, mockApi)

    expect(result).to.deep.equal([{ file: 'empty.csv', lines: [] }])
  })

  it('returns empty array when no files are available', async () => {
    const mockApi = {
      listFiles: async () => [],
      downloadFile: async () => ''
    }

    const result = await getFilesData(null, mockApi)

    expect(result).to.have.lengthOf(0)
  })
})
