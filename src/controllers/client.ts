import dgram from 'node:dgram'
import { getCurrentTime, setCurrentTime } from '../repositories/client'
import type { DTO } from './server'

const port = 12345
const serverPort = 1234

export const initClient = () => {
  const client = dgram.createSocket('udp4')

  client.on('message', (msg, rinfo) => {
    const data: DTO = JSON.parse(msg.toString())
    if (data.type === 'time-request') {
      // Kirim waktu lokal ke server
      const currentTime = getCurrentTime()
      const resMessage: DTO = {
        type: 'time-response',
        message: 'Here is my time',
        time: currentTime,
      }
      client.send(
        JSON.stringify(resMessage),
        serverPort,
        rinfo.address,
        (err) => {
          if (err) {
            console.error(`Error sending time: ${err}`)
          } else {
            console.log(
              `Sent time response: ${currentTime} to ${rinfo.address}:${serverPort}`
            )
          }
        }
      )
    } else if (data.type === 'offset' && typeof data.offset === 'number') {
      // Set waktu lokal sesuai offset
      setCurrentTime(data.offset)
      console.log(`Received offset: ${data.offset}, adjusted local time`)
    }
  })

  client.bind(port, () => {
    console.log(`Client is listening on port ${port}`)
  })
}
