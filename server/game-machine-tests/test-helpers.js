const fs = require('fs').promises
const path = require('path')
const { State, interpret } = require('xstate')

const gameMachine = require('../game-machine')

const getState = async (filename) => {
  const data = await fs.readFile(path.join('game-machine-tests', 'saved_states', filename + '.json'))
  const previousState = State.create(JSON.parse(data))
  const resolvedState = gameMachine.resolveState(previousState)
  return resolvedState
}

const getService = async (filename, config = {}) => {
  const resolvedState = await getState(filename)
  const machine = interpret(gameMachine.withConfig(config)).start(resolvedState)
  return machine
}

module.exports = {
  getState,
  getService
}
