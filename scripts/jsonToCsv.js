import fs from 'fs/promises'

export function extractUsefullData(table) {
  const newTable = []
  table.forEach((row, rowi) => {
    let name = 'NULL' // #Ц24-000000             000 000 Ритейл
    let name2 = 'NULL' //  0000-0000
    let serial = 'NULL' //  S/N: 000000000000
    let model = 'NULL'// AA-000
    let status = 'NULL' //  Готов
    let other = []

    row.forEach((col, coli) => {
      col.forEach((e, i) => {
        if (coli === 0 && i === 1) return name = e
        if (coli === 3 && i === 1) return status = e
        if (coli === 1 && i === 2) return serial = e
        if (coli === 0 && i === 0) return name2 = e
        if (coli === 1 && i === 1) return model = e
        other.push(e)
      })
    })

    newTable.push([name, name2, serial, model, status])
  })

  return newTable
}

function makeCsv(table) {
  return table.map(el => el.join('\t')).join('\n')
}

export const extractToCsv = json => makeCsv(extractUsefullData(json))

export function transform() {
  fs.readFile('/tmp/table.json').then(table => {
    table = JSON.parse(table)
    const newTable = extractUsefullData(table)
    fs.writeFile('/tmp/test.txt', makeCsv(newTable), 'utf8')
      .then(() => console.log('ok'))
  })
}