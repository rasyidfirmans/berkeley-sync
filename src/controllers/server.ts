import dgram from 'node:dgram'

const port = 1234

export const initServer = () => {
  const server = dgram.createSocket('udp4')

  server.on('message', (msg, rinfo) => {
    console.log(`Received message: ${msg}`)
  })

  server.on('error', (err) => {
    console.error(`Server error:\n${err.stack}`)
    server.close()
  })

  server.bind(port, () => {
    console.log(`Server is listening on port ${port}`)
  })
}
