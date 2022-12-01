const createServer = require('http').createServer
const Server = require('socket.io').Server
const danmuMiddleware = require('./src/danmu')

const PORT = 4000

const httpServer = createServer()

danmuMiddleware(httpServer)

const io = new Server(httpServer, {})
io.on('connection', (socket) => {
  console.log(`[connection] ${socket.id} ${socket.conn.remoteAddress}`)

  let room = socket.handshake.query?.room
  let nickname = socket.handshake.query?.nickname

  /* 重新设置房间 */
  socket.rooms.forEach((room) => {
    socket.leave(room)
  })
  if (room) socket.join(room)

  function send(params) {
    const _params = {
      ...params,
      from: socket.id,
      sender: nickname,
    }
    console.log(_params, socket.rooms.values())
    socket.rooms.forEach((room) => {
      io.to(room).emit('message', _params)
    })
  }

  /* 加入/离开房间 */
  send({ action: 'join' })
  socket.on('disconnecting', () => {
    send({ action: 'leave' })

    console.log(`[disconnect] ${socket.id} ${socket.conn.remoteAddress}`)
  })

  /* 修改昵称 */
  socket.on('nickname', (params) => {
    const oldNickname = nickname
    nickname = params?.nickname || nickname
    send({
      action: 'nickname',
      oldNickname,
    })
    console.log('nickname', nickname)
  })

  /* 不需要处理的其他广播消息 */
  socket.on('message', (params) => {
    send(params)
    console.log('[message]', params)
  })
})

httpServer.listen(PORT, () => {
  console.log('正在监听端口：' + PORT)
})
