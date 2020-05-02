const objectPath = require('object-path')
const clients = require('./clients')
const gameService = require('./game-service')
const dice = require('./dice')
const { ValidationError } = require('./error')
const stageCards = require('./stage-cards')

module.exports = {
  getStageCards: (_socket, _data, cb) => {
    cb({ error: null, data: stageCards })
  },
  refresh: (socket, data, cb) => {
    gameService.send('REFRESH')
    // cb(null, null)
  },
  registerPlayer: (socket, data, cb) => {
    const id = objectPath.get(data, 'playerID')
    const name = objectPath.get(data, 'playerName')
    if (typeof id !== 'number' || typeof name !== 'string') {
      console.log('invalid request')
      cb(new ValidationError('Expect strings'), null)
      return
    }
    const idString = id.toString()
    clients.clients[socket.id].playerID = idString

    gameService.send({
      type: 'REGISTER_PLAYER',
      playerID: idString,
      playerName: name
    })
    // cb(null, null)
  },
  leave: (socket, data, cb) => {
    console.log('leave')
    const id = objectPath.get(data, 'playerID')
    // remove associations with this player
    for (const i in clients.clients) {
      if (clients.clients[i].playerID === id) {
        clients.clients[i].playerID = null
        console.log('removed associated client')
      }
    }
    gameService.send({
      type: 'REMOVE_PLAYER',
      playerID: id
    })
  },
  roll: (socket, data, cb) => {
    console.log('roll')
    // get player id from socket
    const playerID = clients.clients[socket.id].playerID
    if (playerID) {
      gameService.send({
        type: 'ROLL',
        playerID: playerID,
        value: dice.throw()
      })
    }
  },
  moveAfterRoll: (socket, data, cb) => {
    const playerID = clients.clients[socket.id].playerID
    if (playerID) {
      gameService.send({
        type: 'MOVE',
        playerID: playerID
      })
    }
  },
  turnCardInGrid: (socket, data, cb) => {
    const playerID = clients.clients[socket.id].playerID
    if (playerID) {
      gameService.send({
        type: 'TURN_STAGE_CARD',
        playerID: playerID,
        cardGridIndex: parseInt(data.data)
      })
    }
  },
  collectCardsFromGrid: (socket, data, cb) => {
    const playerID = clients.clients[socket.id].playerID
    if (playerID) {
      gameService.send({
        playerID: playerID,
        type: 'COLLECT_STAGE_CARDS'
      })
    }
  },
  drawCardsForAuction: (socket, data, cb) => {
    const playerID = clients.clients[socket.id].playerID
    if (playerID) {
      gameService.send({
        type: 'DRAW_CARDS_FOR_AUCTION',
        playerID: playerID
      })
    }
  }
}
