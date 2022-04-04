export default {
  root: './packages/rsocket',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        app: './packages/rsocket/client.html',
      },
    },
  },
  server: {
    open: './packages/rsocket/client.html',
  },
}
