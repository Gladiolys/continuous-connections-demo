# Continuous connections demo


## Запуск

Установить зависимости:
```
yarn install
```

Запустить сервер нужного пакета:
```
yarn start:regular-pooling
yarn start:long-pooling
yarn start:server-side-events
yarn start:web-socket
yarn start:rsocket-server
```

Для rsocket код клиента нужно запускать коммандой.
```
yarn start:rsocket-client
```
И в браузере открыть http://localhost:3000/client.html

Для остальных примеров нужно просто открыть в барузере html файл нужного клиента. Найти файл можно
по следующим путям: 
```
packages/<имя пакета>/client.html
```
