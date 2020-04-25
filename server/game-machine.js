const { Machine } = require('xstate')

const gameMachine = Machine({
  id: 'gameMachine',
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
      // actions: () => console.log('new client')
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

module.exports = gameMachine
