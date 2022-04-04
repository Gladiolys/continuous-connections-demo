// Нужен полифилл из ноды для rsocket-core
import 'buffer'

import { MAX_STREAM_ID, RSocketClient } from 'rsocket-core'
import RSocketWebsocketClient from 'rsocket-websocket-client'
import { every, Flowable, Single } from 'rsocket-flowable'

const USER = {
  name: 'Ivan',
  surname: 'Petrov',
  location: {
    city: 'Tomsk',
    address: 'Lenina str, 12',
  },
  id: 1,
}

const transportOptions = {
  url: 'ws://localhost:3004',
  wsCreator: (url) => new WebSocket(url),
}
const SETUP_OPTIONS = {
  keepAlive: 1000000,
  lifetime: 100000,
  dataMimeType: 'application/json',
  metadataMimeType: 'application/json',
}

function showMessage(text) {
  const messageDiv = document.createElement('div')
  messageDiv.className = 'message'
  messageDiv.innerText = text
  document.body.append(messageDiv)
}

function showContent(content) {
  const contentDiv = document.createElement('div')
  contentDiv.className = 'content'
  contentDiv.innerText = content
  document.body.append(contentDiv)
}

// Видно что эта часть полностью дублируется на клиенте и сервере,
// то есть особой разницы между клиентов и сервером нет
const transport = new RSocketWebsocketClient(transportOptions)

function make(data) {
  return {
    data,
    metadata: '',
  }
}

class SymmetricResponder {
  fireAndForget(payload) {
    showContent(payload)
  }

  requestResponse(payload) {
    showContent(`requestResponse ${payload.data} \n metadata: ${payload.metadata}`)
    return Single.error(new Error())
  }

  requestStream(payload) {
    showContent(`requestStream ${payload.data} \n metadata: ${payload.metadata}`)

    return every(2000).map(() => make(JSON.stringify(USER)))
  }

  requestChannel() {
    return Flowable.error(new Error())
  }

  metadataPush(payload) {
    showMessage(`metadataPush ${payload}`)
    return Single.error(new Error())
  }
}

function runOperation(socket) {
  let subscription

  return new Promise((resolve, reject) => {
    socket
      .requestStream({
        data: JSON.stringify(USER),
        metadata: '',
      })
      .subscribe({
        onComplete() {
          showMessage('Успешно завершено')
          resolve()
        },
        onError(error) {
          showMessage(`Ошибка ${error.message}`)
          reject(error)
        },
        onNext(payload) {
          showContent(`Следующий итем ${payload.data}`)
        },
        onSubscribe(_subscription) {
          subscription = _subscription
          subscription.request(MAX_STREAM_ID)
        },
      })
  })
}

const client = new RSocketClient({
  setup: SETUP_OPTIONS,
  transport,
  responder: new SymmetricResponder(),
})

client.connect().then((socket) => {
  socket.connectionStatus().subscribe((status) => {
    showMessage(`Статус подключения: ${JSON.stringify(status)}`)
  })
  return runOperation(socket)
})
