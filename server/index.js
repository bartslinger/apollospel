const express = require('express')
const app = express()
const https = require('https')
const http = require('http')
const fs = require('fs').promises
const path = require('path')

const gameService = require('./game-service')
const gameMachine = require('./game-machine')
const { State } = require('xstate')
const api = require('./api')
const admin = require('./admin')
const utils = require('./utils')
const clients = require('./clients')

var deploy = true
if (process.argv[2] && process.argv[2] === 'dev') {
  deploy = false
}

let server
if (deploy) {
  const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/spel.gaatvanzelf.nl/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/spel.gaatvanzelf.nl/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/spel.gaatvanzelf.nl/chain.pem')
  }
  server = https.createServer(options, app)
} else {
  server = http.createServer(app)
}

const services = {
  'admin.movePlayer': admin.movePlayer,
  'admin.saveState': admin.saveState,
  getStageCards: api.getStageCards,
  refresh: api.refresh,
  register: api.registerPlayer,
  leave: api.leave,
  roll: api.roll,
  moveAfterRoll: api.moveAfterRoll,
  turnCardInGrid: api.turnCardInGrid,
  collectCardsFromGrid: api.collectCardsFromGrid
}

const io = require('socket.io')(server)

io.on('connection', (socket) => {
  console.log('new client:', socket.id)
  clients.add(socket)

  socket.on('disconnect', () => {
    console.log('client disconnected')
    clients.remove(socket)
  })

  Object.keys(services).forEach(function (s) {
    socket.on(s, (data, cb) => {
      console.log('received command', s, data)
      const validatedCallback = utils.validateCallback(cb)
      const { err, validatedData } = utils.validateData(data)
      if (err) {
        console.log('Invalid request:', s, err)
        validatedCallback(err, null)
        return
      }
      // Call the service with an object and callback function
      services[s](socket, validatedData, validatedCallback)
    })
  })
})

io.on('error', (err) => {
  console.log('errrororrororo', err)
})

const startGame = async (filename) => {
  if (!filename) {
    gameService.start()
    return
  }
  const data = await fs.readFile(path.join(process.env.HOME, 'apollosave', filename + '.json'))
  const previousState = State.create(JSON.parse(data))
  const resolvedState = gameMachine.resolveState(previousState)

  try {
    gameService.start(resolvedState)
  } catch (err) {
    console.log('gezeur', err)
  }
}

startGame(process.argv[3])

server.listen(2001, () => {
  console.log('server up and running port 2001')
})
