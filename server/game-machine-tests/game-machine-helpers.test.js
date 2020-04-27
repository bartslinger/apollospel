const gameMachineHelpers = require('../game-machine-helpers')
const _ = require('lodash')

jest.mock('lodash')

test('shuffle stage cards', () => {
  const context = {
    stageCardsDeck: [10, 11, 12],
    stageCardsDiscarded: [20, 21, 22, 23]
  }
  _.shuffle.mockReturnValue([20, 22, 10, 12, 11, 21, 23])
  const shuffled = gameMachineHelpers.shuffleStageCards(context)
  expect(_.shuffle.mock.calls[0][0]).toEqual([10, 11, 12, 20, 21, 22, 23])
  expect(shuffled.length).toBe(7)
})
