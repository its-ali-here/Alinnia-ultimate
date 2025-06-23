export interface ParsedCsvRow {
  [key: string]: string
}

export interface ParsedCsvResult {
  headers: string[]
  rows: ParsedCsvRow[]
  rowCount: number
  error?: string
}

/**
 * Basic CSV parser. Handles simple cases, including quoted fields.
 * Does not handle complex cases like quotes within quoted fields perfectly.
 */
export function parseCsv(csvText: string): ParsedCsvResult {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0, error: "CSV is empty" }
  }

  const headerLine = lines[0]
  const headers: string[] = []
  let inQuotes = false
  let currentHeader = ""
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      headers.push(currentHeader.trim())
      currentHeader = ""
    } else {
      currentHeader += char
    }
  }
  headers.push(currentHeader.trim()) // Add the last header

  const rows: ParsedCsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === "") continue // Skip empty lines

    const row: ParsedCsvRow = {}
    const values: string[] = []
    let inValueQuotes = false
    let currentValue = ""

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inValueQuotes = !inValueQuotes
      } else if (char === "," && !inValueQuotes) {
        values.push(currentValue.trim())
        currentValue = ""
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim()) // Add the last value

    if (values.length === headers.length) {
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    } else {
      console.warn(
        `Skipping line ${i + 1}: Mismatch in number of columns. Expected ${headers.length}, got ${values.length}. Line: "${line}"`,
      )
    }
  }

  return { headers, rows, rowCount: rows.length }
}
