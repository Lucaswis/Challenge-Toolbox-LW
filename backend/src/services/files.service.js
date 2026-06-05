const defaultApi = require('./externalApi.service')

function parseCSV (content) {
  const lines = content.split('\n').filter((line) => line.trim())

  if (lines.length < 2) return []

  const rows = lines.slice(1)

  return rows.reduce((acc, line) => {
    const parts = line.split(',')

    if (parts.length < 4) return acc

    const [, text, numberStr, hex] = parts

    if (!text || !numberStr || !hex) return acc

    const number = Number(numberStr)
    if (Number.isNaN(number)) return acc

    const cleanHex = hex.trim()
    if (cleanHex.length !== 32) return acc

    acc.push({ text: text.trim(), number, hex: cleanHex })
    return acc
  }, [])
}

async function listFiles (api = defaultApi) {
  const files = await api.listFiles()
  return { files }
}

async function getFilesData (fileName = null, api = defaultApi) {
  const { files: allFilenames } = await listFiles(api)
  const targets = fileName
    ? allFilenames.filter((name) => name === fileName)
    : allFilenames

  const results = await Promise.all(
    targets.map(async (filename) => {
      try {
        const content = await api.downloadFile(filename)
        const lines = parseCSV(content)
        return { file: filename, lines }
      } catch (err) {
        return { file: filename, lines: [], error: err.message }
      }
    })
  )

  return results
}

module.exports = { parseCSV, listFiles, getFilesData }
