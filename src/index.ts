import { initClient } from './controllers/client'
import { initServer } from './controllers/server'

const mode = process.argv[2]

if (mode === 'server') {
  initServer()
} else {
  initClient()
}
