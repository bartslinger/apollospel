const testHelpers = require('./test-helpers')
const _ = require('lodash')
jest.mock('lodash')

test('player moves and gets to turn a free stage', async () => {
  const service = await testHelpers.getService('rolled_to_land_on_free_stage')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[1].positionInfo.square).toBe(10)

    expect(state.value).toBe('turningFreeStage')
    expect(state.context.activePlayerID).toBe('222')

    // also expect the stage grid to be replenished
    expect(state.context.stageCardsGrid).toEqual([14, 15, 16, 17, 18, 13, 12, 11])
    expect(state.context.stageCardsDeck).toEqual([10])
  })
  service.send('MOVE', { playerID: '222' })
})

test('player moves and gets to turn a free stage reshuffle', async () => {
  const service = await testHelpers.getService('rolled_to_land_on_free_stage_deck_empty')
  _.shuffle.mockReset()
  _.shuffle.mockReturnValueOnce([13, 10, 12, 11])
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(_.shuffle.mock.calls[0][0]).toEqual([10, 11, 12, 13])

    expect(state.context.players[1].positionInfo.square).toBe(10)

    expect(state.value).toBe('turningFreeStage')
    expect(state.context.activePlayerID).toBe('222')

    // also expect the stage grid to be replenished
    expect(state.context.stageCardsGrid).toEqual([14, 15, 16, 17, 18, 11, 12, 10])
    expect(state.context.stageCardsDeck).toEqual([13])
    expect(state.context.stageCardsDiscarded).toEqual([])
  })
  service.send('MOVE', { playerID: '222' })
})

test('player turns a free stage card', async () => {
  const service = await testHelpers.getService('free_stage_before_turning_card')
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(state.value).toBe('collectingFreeStage')
    expect(state.context.activePlayerID).toBe('222')
    expect(state.context.stageCardsGridMask).toEqual([false, false, true, false, false])
    expect(state.context.eventInfo.type).toBe('turnCard')
    expect(state.context.eventInfo.turnCardIndex).toBe(2)
  })
  service.send('TURN_STAGE_CARD', { playerID: '222', cardGridIndex: 2 })
})

test('player collects a free stage card', async () => {
  const service = await testHelpers.getService('free_stage_after_turning_card')
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(state.value).toBe('rolling')
    expect(state.context.activePlayerID).toBe('333')
    expect(state.context.stageCardsGridMask).toEqual([false, false, false, false, false])
    // Not refilling the grid here
    expect(state.context.stageCardsGrid).toEqual([14, 15, -1, 17, 18])
    expect(state.context.stageCardsDeck).toEqual([10, 11, 12, 13])
    expect(state.context.players[1].stageCards).toEqual([16])
  })
  service.send('COLLECT_STAGE_CARDS', { playerID: '222' })
})
