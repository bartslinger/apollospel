const { Machine, assign } = require('xstate')

const gameMachine = Machine({
  id: 'gameMachine',
  initial: 'initializing',
  context: {
    players: [],
    activePlayer: 0,
    dieRoll: -1,
    gamePhase: 'rolling',
    test: ''
  },
  on: {
    REGISTER_PLAYER: {
      actions: 'registerPlayer'
    },
    REMOVE_PLAYER: {
      actions: 'removePlayer'
    },
    MOVE_PLAYER: {
      actions: 'movePlayer'
    }
  },
  states: {
    initializing: {
      on: {
        '': {
          target: 'rolling'
        }
      }
    },
    rolling: {
      on: {
        ROLL: {
          target: 'afterRoll',
          actions: 'dieRoll',
          guard: 'isPlayersTurn'
        }
      }
    },
    afterRoll: {
      on: {
        MOVE: {
          target: 'continueNextPlayer',
          actions: 'movePlayer',
          guard: 'isPlayersTurn'
        }
      }
    },
    continueNextPlayer: {
      on: {
        '': {
          target: 'rolling',
          actions: 'activateNextPlayer'
        }
      }
    }
  }
}, {
  actions: {
    registerPlayer: (context, event) => {
      console.log('registering player', event)
      const playerID = event.playerID
      var players = context.players
      for (const i in players) {
        console.log(i)
        if (playerID === players[i].id) {
          // this is a match, update name
          players[i].name = event.playerName
          return assign({ players: () => players })
        }
      }
      // no match, create player
      players.push({
        name: event.playerName,
        id: event.playerID,
        money: 100,
        positionInfo: {
          ring: 0,
          square: 0
        }
      })
      return assign({ players: () => players })
    },
    removePlayer: (context, event) => {
      const playerID = event.playerID
      var players = context.players
      for (const i in players) {
        if (playerID === players[i].id) {
          // this is a match, update name
          players.splice(i, 1)
          var newActivePlayer = context.activePlayer
          if (context.activePlayer > parseInt(i)) {
            console.log('PLAYERREMOVED BIGGER PLAYER ID')
            newActivePlayer -= 1
          }
          return assign({
            players: () => players,
            activePlayer: () => newActivePlayer
          })
        }
      }
    },
    dieRoll: assign({
      dieRoll: (context, event) => event.value
    }),
    movePlayer: assign({
      players: (context, event) => {
        // event has the playerID and number of steps
        var players = JSON.parse(JSON.stringify(context.players))
        for (const i in players) {
          if (context.activePlayer.toString() === i) {
            const before = players[i].positionInfo.square
            var after = players[i].positionInfo.square + context.dieRoll
            const crossOne = (before <= 8 && after > 8)
            const crossTwo = (before <= 18 && after > 18)
            if (crossOne && context.dieRoll < 2) {
              after = 8
            }
            if (crossTwo && context.dieRoll < 2) {
              after = 18
            }
            players[i].positionInfo.square = after
            players[i].positionInfo.square %= 20
            break
          }
        }
        return players
      }
    }),
    // moveSpecificPlayer: assign({
    //   players: (context, event) => {
    //     // event has the playerID and number of steps
    //     var players = JSON.parse(JSON.stringify(context.players))
    //     for (const i in players) {
    //       if (event.playerID === players[i].id) {
    //         players[i].positionInfo.square += event.steps
    //         players[i].positionInfo.square %= 20
    //         break
    //       }
    //     }
    //     return players
    //   }
    // }),
    activateNextPlayer: assign({
      activePlayer: (context, event) => {
        // How many players are there?
        const numberOfPlayers = context.players.length
        return (context.activePlayer + 1) % numberOfPlayers
      }
    })
  },
  guards: {
    isPlayersTurn: (context, event) => {
      if (context.players[context.activePlayer].id !== event.playerID) {
        console.log('NOT PLAYER TURNNNNNN ')
      }
      return context.players[context.activePlayer].id === event.playerID
    }
  }
})

module.exports = gameMachine
