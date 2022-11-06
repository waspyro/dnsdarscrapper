import * as setting from './settings.js'
import DnsDarScrapper from './lib/Scrapper.js'

console.log('настройки: ')
for (let settingKey in setting) console.log(settingKey, '=', setting[settingKey])
console.log()
console.log()

const scrapper = new DnsDarScrapper(setting)
scrapper.run().then(() => {
  console.log('DONE')
})