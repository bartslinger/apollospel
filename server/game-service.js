const { interpret } = require('xstate')
const fs = require('fs').promises
const path = require('path')
const clients = require('./clients')

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

    var clientStateUpdate = {
      playerInfos: [],
      yourPlayerIndex: -1,
      activePlayerIndex: state.context.activePlayerIndex,
      sponsorIndex: -1,
      auctionMasterIndex: 0,
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
        positionInfo: state.context.players[i].positionInfo,
        stageInfos: getStageInfos(state.context.stageCards, state.context.players[i].id)
      }
      clientStateUpdate.playerInfos.push(player)

      // Does this player have the sponsor hat?
      if (state.context.players[i].id === state.context.sponsorHatOwner) {
        clientStateUpdate.sponsorIndex = parseInt(i)
      }

      if (state.context.players[i].id === client.playerID) {
        clientStateUpdate.yourPlayerIndex = parseInt(i)
      }
    }
    client.socket.emit('state', clientStateUpdate)
    client.socket.emit('context', state.context)
  }
})

module.exports = gameService
