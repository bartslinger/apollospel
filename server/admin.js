const objectPath = require('object-path')
const clients = require('./clients')
const gameService = require('./game-service')
const dice = require('./dice')
const { ValidationError } = require('./error')

module.exports = {
  movePlayer: (socket, data, cb) => {
    const id = objectPath.get(data, 'playerID')
    const steps = objectPath.get(data, 'steps')

    gameService.send({
      type: 'MOVE_PLAYER',
      playerID: id,
      steps: steps
    })
  }
}
