import fs from 'fs'

const dataLocation = './output/'
if(!fs.statSync(dataLocation)) fs.mkdirSync(dataLocation)

export const sessionCacheLocation = dataLocation + 'session.txt'
export const jsonSaveLocation = dataLocation + 'data.json'
export const csvSaveLocation = dataLocation + 'csv.json'
export const login = ''
export const password = ''
export const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'