const { RSocketServer, MAX_STREAM_ID } = require('rsocket-core')
const RSocketWebSocketServer = require('rsocket-websocket-server')
const { Single, every, Flowable } = require('rsocket-flowable')

const PORT = process.env.PORT || 3004

const USER = {
  name: 'Ivan',
  surname: 'Petrov',
  location: {
    city: 'Tomsk',
    address: 'Lenina str, 12',
  },
  id: 1,
}

const WebSocketTransport = RSocketWebSocketServer.default

const transport = new WebSocketTransport({ port: PORT })

function make(data) {
  return {
    data,
    metadata: '',
  }
}

function logRequest(type, payload) {
  console.log(
    `Сервер получил ${type} с payload: data: ${payload.data || 'null'},
      metadata: ${payload.metadata || 'null'}`
  )
}

class SymmetricResponder {
  fireAndForget(payload) {
    logRequest('fnf', payload)
  }

  requestResponse(payload) {
    logRequest('requestResponse', payload)
    return Single.error(new Error())
  }

  requestStream(payload) {
    logRequest('requestStream', payload)

    return every(2000).map(() => make(JSON.stringify(USER)))
  }

  requestChannel() {
    return Flowable.error(new Error())
  }

  metadataPush(payload) {
    logRequest('metadataPush', payload)
    return Single.error(new Error())
  }
}

function runOperation(socket) {
  console.log('Пришел клиент')

  let subscription

  return new Promise((resolve, reject) => {
    socket.requestStream({
      data: JSON.stringify(USER),
      metadata: '',
    }).subscribe({
      onComplete() {
        console.log('Complete')
        resolve()
      },
      onError(error) {
        console.log('Error(%s)', error.message)
        reject(error)
      },
      onNext(payload) {
        console.log('Next(%s)', payload.data)
      },
      onSubscribe(_subscription) {
        subscription = _subscription
        subscription.request(MAX_STREAM_ID)
      },
    })
  })
}

const rSocketServer = new RSocketServer({
  transport,
  getRequestHandler: (socket) => {
    runOperation(socket)
    return new SymmetricResponder()
  },
})

rSocketServer.start()

console.log(`Сервер запущен на порту ${PORT}`)
