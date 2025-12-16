import dgram from 'node:dgram'

const port = 1234
const broadcast = '255.255.255.255'
const clientPort = 12345
const nodeTimes: Record<string, number> = {}

export type DTO = {
  type: 'time-request' | 'time-response' | 'offset'
  message: string
  time?: number
  offset?: number
}

export const initServer = () => {
  const server = dgram.createSocket('udp4')

  server.on('message', (msg, rinfo) => {
    const data: DTO = JSON.parse(msg.toString())
    if (data.type === 'time-response' && typeof data.time === 'number') {
      nodeTimes[`${rinfo.address}:${rinfo.port}`] = data.time
      console.log(
        `Received time from ${rinfo.address}:${rinfo.port}: ${data.time}`
      )
    }
  })

  server.on('error', (err) => {
    console.error(`Server error:\n${err.stack}`)
    server.close()
  })

  server.bind(port, () => {
    server.setBroadcast(true)
    console.log(`Server is listening on port ${port}`)

    setInterval(() => {
      nodeTimes['server'] = Date.now()

      const msg: DTO = { type: 'time-request', message: 'Give your time' }
      server.send(JSON.stringify(msg), clientPort, broadcast, (err) => {
        if (err) {
          console.error(`Error sending message: ${err}`)
        } else {
          console.log(`\nBroadcasted time request`)
        }
      })

      setTimeout(() => {
        const times = Object.values(nodeTimes)
        if (times.length > 0) {
          const avg = Math.round(
            times.reduce((a, b) => a + b, 0) / times.length
          )
          console.log(`Average time: ${new Date(avg).toLocaleString('id-ID')}`)

          Object.entries(nodeTimes).forEach(([key, _time]) => {
            if (key !== 'server') {
              const [address, portStr] = key.split(':')
              const newTimeMsg: DTO = {
                type: 'offset',
                message: 'Set your clock to this absolute time',
                time: avg,
              }
              server.send(
                JSON.stringify(newTimeMsg),
                Number(portStr),
                address,
                (err) => {
                  if (err) {
                    console.error(
                      `Error sending new time to ${address}:${portStr}`
                    )
                  } else {
                    console.log(
                      `Sent new time ${new Date(avg).toLocaleString(
                        'id-ID'
                      )} to ${address}:${portStr}`
                    )
                  }
                }
              )
            }
          })
        }
      }, 2000)
    }, 10000)
  })
}
