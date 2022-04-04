const http = require('http')
const ws = require('ws')

const PORT = process.env.PORT || 3003

const USER = {
  name: 'Ivan',
  surname: 'Petrov',
  location: {
    city: 'Tomsk',
    address: 'Lenina str, 12',
  },
  id: 1,
}

const webSocketServer = new ws.Server({ noServer: true })

function onConnect(wsConnection) {
  wsConnection.on('message', (message) => {
    console.log(`Пришло сообщение:, ${message}!`)

    let i = 0

    // eslint-disable-next-line no-use-before-define
    const timer = setInterval(write, 2000)
    // eslint-disable-next-line no-use-before-define
    write()

    function write() {
      i++

      // После 4 сообщений решаем закрыть соединение
      if (i === 5) {
        console.log('Соединение закрыто сервером')
        clearInterval(timer)
        wsConnection.close(1000, 'Все данные переданы')
        return
      }

      wsConnection.send(JSON.stringify(USER))
    }
  })
}

const server = http.createServer((req, res) => {
  // Если не переданы все необходимые заголовки
  // сообщающие о желании перейти на web-socket, то завершаем общение
  if (
    !req.headers.upgrade ||
    req.headers.upgrade.toLowerCase() !== 'websocket' ||
    !req.headers.connection.match(/\bupgrade\b/i)
  ) {
    res.end()
    return
  }

  webSocketServer.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect)
})

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})
