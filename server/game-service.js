const { interpret } = require('xstate')
const fs = require('fs').promises
const path = require('path')
const clients = require('./clients')
const dice = require('./dice')

const gameMachine = require('./game-machine')

const gameService = interpret(gameMachine).onTransition(state => {
  // save state
  // console.log(state.context.players)
  fs.writeFile(path.join(process.env.HOME, 'apollosave/02.json'), JSON.stringify(state, null, 2))
    .then((res) => {
      console.log('saved')
    })
    .catch((err) => {
      console.log('error saving', err)
    })

  for (const i in clients.clients) {
    // console.log(clients[i])
    clients.clients[i].socket.emit('state', state.context)
  }
})

module.exports = gameService
