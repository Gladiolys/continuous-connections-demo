const http = require('http')

const PORT = process.env.PORT || 3002

const USER = {
  name: 'Ivan',
  surname: 'Petrov',
  location: {
    city: 'Tomsk',
    address: 'Lenina str, 12',
  },
  id: 1,
}

function requestListener(req, res) {
  console.log('Клиент подключился к каналу')

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  })

  let i = 0

  // eslint-disable-next-line no-use-before-define
  const timer = setInterval(write, 2000)
  // eslint-disable-next-line no-use-before-define
  write()

  function write() {
    i++

    // После 4 сообщений решаем отправить завершающее сообщение в
    // кастомный канал и закрыть соединение
    if (i === 5) {
      res.write(`event: custom\ndata: ${JSON.stringify(USER)}\n\n`)
      clearInterval(timer)
      res.end()
      return
    }

    res.write(`data: ${JSON.stringify(USER)}\n\n`)
  }
}

const server = http.createServer(requestListener)

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})
