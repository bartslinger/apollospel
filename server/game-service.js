const { interpret } = require('xstate')
const fs = require('fs').promises
const path = require('path')
const clients = require('./clients')
const dice = require('./dice')

const gameMachine = require('./game-machine')

const pad = (n, width, z) => {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

var saveCounter = 1
console.log(pad(saveCounter, 5))

const gameService = interpret(gameMachine).onTransition(state => {
  // save state
  // console.log(state.context.players)
  const saveName = pad(saveCounter, 5)
  saveCounter += 1
  fs.writeFile(path.join(process.env.HOME, 'apollosave', saveName + '.json'), JSON.stringify(state, null, 2))
    .then((res) => {
      console.log('saved')
    })
    .catch((err) => {
      console.log('error saving', err)
    })

  for (const c in clients.clients) {
    const client = clients.clients[c]

    var clientStateUpdate = {
      playerInfos: [],
      yourPlayerIndex: -1,
      activePlayerIndex: state.context.activePlayer,
      gamePhase: state.value,
      auctionInfo: {
        bettingIndex: 0
      },
      dieRoll: state.context.dieRoll
    }

    for (const i in state.context.players) {
      const player = {
        name: state.context.players[i].name,
        money: state.context.players[i].money,
        positionInfo: state.context.players[i].positionInfo
      }
      clientStateUpdate.playerInfos.push(player)
      if (state.context.players[i].id === client.playerID) {
        clientStateUpdate.yourPlayerIndex = parseInt(i)
      }
    }
    client.socket.emit('state', clientStateUpdate)
    client.socket.emit('context', state.context)
  }
})

module.exports = gameService
