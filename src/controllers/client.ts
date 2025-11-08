import dgram from 'node:dgram'
import os from 'os'

const serverPort = 1234
const serverAddress = '172.20.10.2'
const clientAddress = getClientAddress()

export const initClient = () => {
  const client = dgram.createSocket('udp4')

  setInterval(() => {
    client.send(
      `Hello from client: ${clientAddress}`,
      serverPort,
      serverAddress,
      (err) => {
        if (err) {
          console.error('Error sending message:', err)
        } else {
          console.log('Message sent successfully')
        }
      }
    )
  }, 3000)
}

function getClientAddress(): string {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]!) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return ''
}
