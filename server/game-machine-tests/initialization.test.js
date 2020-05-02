const gameMachine = require('../game-machine')
const _ = require('lodash')
jest.mock('lodash')

test('initialize state machine', async () => {
  _.shuffle.mockReturnValue([
    0, 2, 13, 15, 18, 22, 23, 25, 27, 31, 32, 40,
    19, 20, 21, 24, 26, 28, 29, 30, 33, 34, 35, 36,
    1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 17,
    37, 38, 39, 41, 42, 43
  ])
  const { initialState } = gameMachine

  // this is just an array containing 0..43
  const stageCardIndices = Array(44).fill(0).map((v, i) => i)

  expect(_.shuffle.mock.calls[0][0]).toEqual(stageCardIndices)
  expect(initialState.value).toBe('rolling')
  expect(initialState.context.stageCardsGrid)
    .toEqual([0, 2, 13, 15, 18, 22, 23, 25, 27, 31, 32, 40])

  expect(initialState.context.stageCardsDeck)
    .toEqual([19, 20, 21, 24, 26, 28, 29, 30, 33, 34, 35, 36,
      1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 17,
      37, 38, 39, 41, 42, 43])
})
