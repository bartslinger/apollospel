const clients = require('./clients')
const dice = require('./dice')

const { Machine, interpret } = require('xstate')

const gameMachine = Machine({
  initial: 'initializing',
  context: {
    players: [
      {
        name: 'bart',
        money: 100,
        position: {
          ring: 0,
          field: 0
        }
      },
      {
        name: 'freejkyboy',
        money: 2001,
        position: {
          ring: 3,
          field: 0
        }
      }
    ]
  },
  on: {
    CONNECT_CLIENT: {
      actions: () => console.log('new client')
    }
  },
  states: {
    initializing: {
      on: {
        '': {
          target: 'throwingDice'
        }
      }
    },
    throwingDice: {

    }
  }
})

const gameService = interpret(gameMachine).onTransition(state => {
  console.log(state.event)

  for (const i in clients.clients) {
    // console.log(clients[i])
    clients.clients[i].socket.emit('state', state.context)
  }
})

module.exports = gameService
