const http = require('http')

const PORT = process.env.PORT || 3001

const USER = {
  name: 'Ivan',
  surname: 'Petrov',
  location: {
    city: 'Tomsk',
    address: 'Lenina str, 12',
  },
  id: 1,
}

let subscribers = {}

function requestListener(req, res) {
  const id = Math.random()
  console.log(`Добавился новый подписчик ${id}`)

  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })

  subscribers[id] = res

  req.on('close', () => {
    console.log(`Подписчик закрыл соединение ${id}`)

    delete subscribers[id]
  })
}

// Завершение соединений при закрытии сервера
function shutDown() {
  // eslint-disable-next-line no-restricted-syntax
  for (const id of Object.getOwnPropertyNames(subscribers)) {
    const res = subscribers[id]
    res.end()
  }
}

process.on('SIGINT', shutDown)

// Отправка данных подписчикам в момент их появления
function publish() {
  console.log('Всем подписчиками отправлено сообщение')
  // eslint-disable-next-line no-restricted-syntax
  for (const id of Object.getOwnPropertyNames(subscribers)) {
    const res = subscribers[id]
    res.end(JSON.stringify(USER))
  }

  subscribers = {}
}

setInterval(publish, 10000)

const server = http.createServer(requestListener)

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})
