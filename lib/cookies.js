export function parseSetCookies(cookies = []) {
  if(typeof cookies === 'string') cookies = [cookies]
  return cookies.map(str => {
    const parts = str.split(';').map(part => part.trim().split('='))
    const [name, value] = parts.shift()
    const cookie = {name,value}
    for(const [key, value = true] of parts)
      cookie[key.toLowerCase()] = typeof value === 'string'
        ? decodeURIComponent(value) : value
    return cookie
  })
}

export function stringifyCookiesArr(cookies) {
  return cookies
    // .filter(cookie => cookie.value) //todo: check expiration
    .map(({name, value}) => `${name}=${value}`)
    .join('; ')
}
