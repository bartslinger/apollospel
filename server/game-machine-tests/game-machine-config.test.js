const gameMachineConfig = require('../game-machine-config')

test('shuffle stage cards', () => {
  const context = {
    stageCardsDeck: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    stageCardsDiscarded: [20, 21, 22, 23]
  }
  const shuffled = gameMachineConfig.actions.shuffleStageCards(context)
  expect(shuffled.length).toBe(14)
})
