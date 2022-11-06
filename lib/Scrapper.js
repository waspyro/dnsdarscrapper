import fs from 'fs/promises'
import fetch from 'node-fetch'
import {parseSetCookies, stringifyCookiesArr} from "./cookies.js";
import * as cheerio from "cheerio";
import {extractToCsv} from "../scripts/jsonToCsv.js";

export default class DnsDarScrapper {

  session = null
  constructor({jsonSaveLocation, password, login, csvSaveLocation, sessionCacheLocation, userAgent}) {
    this.headers = {'user-agent': userAgent}
    this.host = 'https://technomama.ru/'
    // host = 'http://127.0.0.1/'
    this.cacheFile = sessionCacheLocation
    this.login = login
    this.password = password
    this.jsonSaveLocation = jsonSaveLocation
    this.csvSaveLocation = csvSaveLocation
  }

  getNewSession() {
    return this.request().then(res => {
      const cookies = parseSetCookies(res.headers.raw()['set-cookie'])
      const session = stringifyCookiesArr(cookies)
      return fs.writeFile(this.cacheFile, session).then(r => this.session = session)
    })
  }

  loadCachedSession() {
    return fs.readFile(this.cacheFile, 'utf-8').catch(e => {
      if(e.code !== 'ENOENT') throw new Error(e)
      else return null
    }).then(session => this.session = session)
  }

  listeners = {
    before: [(url) => console.log('> ' + url)],
    after: []
  }

  pull = {
    body: r => r.text()
  }

  request(url = '', opts = {}) {
    opts.follow = 'manual'
    url = this.host + url
    opts.headers = Object.assign({}, this.headers, opts.headers)
    this.listeners.before.forEach(l => l(url, opts))
    return fetch(url, opts).then(r => {
      this.listeners.after.forEach(l => l(url, opts, r))
      if(opts.pull) return this.pull[opts.pull](r)
      return r
    })
  }

  isAuthorised() {
    return this.request()
      .then(r => r.text())
      .then(html => !html.includes('Авторизация'))
  }

  authorise() {
    const body = new URLSearchParams({login: this.login, pass: this.password})
    return this.request('template/api/login.php', {method: 'POST', body})
      .then(r => r.json())
      .then(r => {
        if(r?.[0] !== 'ok') throw new Error('не получилось войти ' + JSON.stringify(r))
        return true
      })
  }

  parseList(html) {
    const $ = cheerio.load(html)
    const cp = $('.row_wrapper')
    const ctn = []
    for(const el of cp) {
      const t = []
      $(el).children().each((i, e) => {
        t.push($(e).text().trim().split('\n').map(el => el.trim()))
      })
      ctn.push(t)
    }
    return ctn
  }

  loadList(page = 1) {
    const body = new URLSearchParams({pagination: page})
    return this.request('template/pages/list.php', {body, method: 'POST'})
      .then(r => r.text())
      .then(html => {
        return this.parseList(html)
      })
  }

  async loadWhole(max = 1000) {
    const table = []
    let page = 0
    while(page++ < max) {
      const data = await this.loadList(page)
      if(!data.length) break
      table.push(...data)
      console.clear()
      console.log('страница: ' + page + '\nзагружено: ' + data.length + '\nвсего загружено: ' + table.length)
    }
    return table
  }

  async run() {
    await this.loadCachedSession()
    if(!this.session) await this.getNewSession()
    if(!this.session) throw new Error('cannot get session')
    this.headers.cookie = this.session
    if(!await this.isAuthorised()) await this.authorise().then(() => console.log('new login'))
    else console.log('old login')
    const table = await this.loadWhole()
    await fs.writeFile(this.jsonSaveLocation, JSON.stringify(table, 0, 1))
      .then(() => console.log('~> ' + this.jsonSaveLocation))
    await fs.writeFile(this.csvSaveLocation, extractToCsv(table))
      .then(() => console.log('~> ' + this.csvSaveLocation))
  }
}