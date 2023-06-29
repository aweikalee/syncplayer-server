const url = require('url')
const fetch = require('node-fetch')

async function getBilibiliDanmuUrl(value) {
  if (!value) return
  if (/^http(s?):\/\/api\.bilibili\.com/.test(value)) return value

  const query = new URLSearchParams(value)
  const cid = query.get('cid')
  if (!cid) return
  return `https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`
}

async function getBilibiliDanmu(url) {
  const response = await fetch(url)
  return await response.text()
}

function danmuMiddleware(httpServer) {
  httpServer.on('request', async (req, res) => {
    function end() {
      res.writeHead(200, { 'Content-Type': 'application/xml' })
      res.end('')
    }
    if (req.method !== 'GET') return end()

    const _url = url.parse(req.url)
    if (_url.pathname !== '/danmu') return end()

    const query = new URLSearchParams(_url.query)
    const t = query.get('t')
    if (!t) return end()

    const targetUrl = await getBilibiliDanmuUrl(decodeURIComponent(t))
    if (!targetUrl) return end()
    try {
      const data = await getBilibiliDanmu(targetUrl)

      res.writeHead(200, { 'Content-Type': 'application/xml' })
      res.end(data)
    } catch (error) {
      res.writeHead(500)
      res.end(
        JSON.stringify({
          message: '弹幕获取失败',
          error: error?.message,
        })
      )
    }
  })
}

module.exports = danmuMiddleware
