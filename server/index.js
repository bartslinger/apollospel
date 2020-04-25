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

var deploy = true
if (process.argv.length > 2) {
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
const io = require('socket.io')(server)

io.on('connection', (socket) => {
  console.log('new client:', socket.id)

  socket.on('register', (data) => {
    api.registerClient(socket, data)
    gameService.send('CONNECT_CLIENT')
  })

  socket.on('error', (err) => {
    console.log(err)
  })

  socket.on('disconnect', () => {
    console.log('client disconnected')
  })
})

io.on('error', (err) => {
  console.log('errrororrororo', err)
})

const startGame = async () => {
  const data = await fs.readFile(path.join(process.env.HOME, 'apollosave/01.json'))
  const previousState = State.create(JSON.parse(data))
  const resolvedState = gameMachine.resolveState(previousState)

  try {
    gameService.start(resolvedState)
  } catch (err) {
    console.log('gezeur', err)
  }
}

startGame()

server.listen(2001, () => {
  console.log('server up and running port 2001')
})
