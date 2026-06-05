const { expect } = require('chai')
const { parseCSV } = require('../src/services/files.service')

const VALID_LINE = 'file1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765'
const HEADER = 'file,text,number,hex'

describe('parseCSV', () => {
  it('parses a valid line correctly', () => {
    const result = parseCSV(`${HEADER}\n${VALID_LINE}`)
    expect(result).to.deep.equal([
      { text: 'RgTya', number: 64075909, hex: '70ad29aacf0b690b0467fe2b2767f765' }
    ])
  })

  it('parses multiple valid lines', () => {
    const csv = [
      HEADER,
      VALID_LINE,
      'file1.csv,AtjW,6,d33a8ca5d36d3106219f66f939774cf5'
    ].join('\n')

    const result = parseCSV(csv)
    expect(result).to.have.length(2)
    expect(result[1]).to.deep.equal({
      text: 'AtjW',
      number: 6,
      hex: 'd33a8ca5d36d3106219f66f939774cf5'
    })
  })

  it('discards lines with fewer than 4 fields', () => {
    const csv = `${HEADER}\nfile1.csv,RgTya,64075909`
    expect(parseCSV(csv)).to.have.lengthOf(0)
  })

  it('discards lines where number is not a valid number', () => {
    const csv = `${HEADER}\nfile1.csv,RgTya,notanumber,70ad29aacf0b690b0467fe2b2767f765`
    expect(parseCSV(csv)).to.have.lengthOf(0)
  })

  it('discards lines where hex is not 32 characters', () => {
    const csv = `${HEADER}\nfile1.csv,RgTya,64075909,tooshort`
    expect(parseCSV(csv)).to.have.lengthOf(0)
  })

  it('returns empty array for empty content', () => {
    expect(parseCSV('')).to.deep.equal([])
  })

  it('returns empty array for header-only content', () => {
    expect(parseCSV(HEADER)).to.deep.equal([])
  })

  it('skips invalid lines and keeps valid ones in the same file', () => {
    const csv = [
      HEADER,
      'file1.csv,OnlyThreeFields,123',
      VALID_LINE
    ].join('\n')

    const result = parseCSV(csv)
    expect(result).to.have.length(1)
    expect(result[0].text).to.equal('RgTya')
  })
})
