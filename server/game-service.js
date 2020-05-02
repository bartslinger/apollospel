const { interpret } = require('xstate')
const fs = require('fs').promises
const path = require('path')
const clients = require('./clients')
const clientState = require('./client-state')

const gameMachine = require('./game-machine')

const getStageInfos = (stageCards, playerID) => {
  var stageInfos = []
  for (const i in stageCards) {
    if (stageCards[i].position === 'player' && stageCards[i].playerID === playerID) {
      stageInfos.push({
        id: parseInt(i),
        values: stageCards[i].values
      })
    }
  }
  return stageInfos
}

const pad = (n, width, z) => {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

var saveCounter = 1

const gameService = interpret(gameMachine).onTransition(state => {
  // save state
  const saveName = pad(saveCounter, 5)
  saveCounter += 1
  fs.writeFile(path.join(process.env.HOME, 'apollosave', saveName + '.json'), JSON.stringify(state, null, 2))
    .then((res) => {
      // console.log('saved')
    })
    .catch((err) => {
      console.log('error saving', err)
    })

  for (const c in clients.clients) {
    const client = clients.clients[c]
    const clientStateUpdate = clientState.deriveClientState(state, client.playerID)
    console.log(clientStateUpdate)
    client.socket.emit('state', clientStateUpdate)
    client.socket.emit('context', state.context)
  }
})

module.exports = gameService
