import dgram from 'node:dgram'
import { exec } from 'node:child_process'
import type { DTO } from './server' // Asumsi DTO diekspor dari server.ts
// Asumsi DTO diekspor dari server.ts

const serverPort = 1234
const clientPort = 12345

export const initClient = () => {
  const client = dgram.createSocket('udp4')

  client.on('message', (msg, rinfo) => {
    const data: DTO = JSON.parse(msg.toString())

    if (data.type === 'time-request') {
      console.log(`Received time request from ${rinfo.address}:${rinfo.port}`)
      const response: DTO = {
        type: 'time-response',
        message: 'Here is my time',
        time: Date.now(),
      }
      client.send(
        JSON.stringify(response),
        rinfo.port,
        rinfo.address,
        (err) => {
          if (err) console.error('Error sending time response:', err)
        }
      )
    }

    if (data.type === 'offset' && typeof data.time === 'number') {
      console.log(
        `Received new absolute time: ${new Date(data.time).toLocaleString(
          'id-ID'
        )}`
      )
      const newTime = new Date(data.time)

      // Fungsi untuk mengubah waktu sistem
      setSystemTime(newTime)
    }
  })

  client.on('listening', () => {
    const address = client.address()
    console.log(`Client listening on ${address.address}:${address.port}`)
  })

  client.bind(clientPort)
}

function setSystemTime(newTime: Date) {
  // Format tanggal menjadi string yang bisa dibaca oleh command line
  // Contoh: "2025-11-26 14:30:00"
  const dateString = `${newTime.getFullYear()}-${String(
    newTime.getMonth() + 1
  ).padStart(2, '0')}-${String(newTime.getDate()).padStart(2, '0')} ${String(
    newTime.getHours()
  ).padStart(2, '0')}:${String(newTime.getMinutes()).padStart(2, '0')}:${String(
    newTime.getSeconds()
  ).padStart(2, '0')}`

  let command: string

  switch (process.platform) {
    case 'win32':
      // Untuk Windows, perlu dijalankan di terminal sebagai Administrator
      command = `date ${dateString.split(' ')[0]} && time ${
        dateString.split(' ')[1]
      }`
      break
    case 'linux':
    case 'darwin': // macOS
      // Untuk Linux/macOS, perlu dijalankan dengan 'sudo'
      command = `sudo date -s "${dateString}"`
      break
    default:
      console.error('Unsupported OS for automatic time setting.')
      return
  }

  console.log(`Executing: ${command}`)
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error setting time: ${error.message}`)
      console.error(
        'Pastikan Anda menjalankan skrip dengan hak akses root/administrator.'
      )
      return
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`)
      return
    }
    console.log(
      `System time successfully set to: ${newTime.toLocaleString('id-ID')}`
    )
  })
}
