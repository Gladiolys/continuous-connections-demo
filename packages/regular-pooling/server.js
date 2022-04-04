const http = require('http')

const PORT = process.env.PORT || 3000

const USER = {
  name: 'Ivan',
  surname: 'Petrov',
  location: {
    city: 'Tomsk',
    address: 'Lenina str, 12',
  },
  id: 1,
}

const requestListener = (req, res) => {
  console.log('Клиент запросил данные')

  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(USER))
}

const server = http.createServer(requestListener)

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})
