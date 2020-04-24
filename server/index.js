const express = require('express')
const app = express()
const https = require('https')
const http = require('http')
const fs = require('fs')

const game = require('./game')

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
  console.log('http')
  server = http.createServer(app)
}
const io = require('socket.io')(server)

io.on('connection', (socket) => {
  console.log('new client:', socket.id)

  socket.on('hello', (data) => {
    console.log('PING', data)
    socket.emit('world')
  })

  socket.on('test-event2', (data) => {
    console.log(data)
  })

  socket.on('chat', (data) => {
    console.log(data)
    socket.emit('chat', {
      id: 2001,
      msg: 'casper zecht: ' + data.test2
    })
  })

  socket.on('casper', (data) => {
    console.log('casper;', data)
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

server.listen(2001, () => {
  console.log('server up and running port 2001')
})
