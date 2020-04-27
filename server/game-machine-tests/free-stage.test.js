const testHelpers = require('./test-helpers')
const _ = require('lodash')
jest.mock('lodash')

test('player gets a free stage', async () => {
  const service = await testHelpers.getService('rolled_to_land_on_free_stage')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[1].positionInfo.square).toBe(10)

    expect(state.value).toBe('rolling')
    expect(state.context.activePlayerID).toBe('333')

    expect(state.context.players[1].stageCards).toEqual([13])
    expect(state.context.stageCardsDeck).toEqual([10, 11, 12])
  })
  service.send('MOVE', { playerID: '222' })
})

test('player does not get a free stage', async () => {
  const service = await testHelpers.getService('rolled_to_land_on_barrier')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[1].positionInfo.square).toBe(8)

    expect(state.value).toBe('rolling')
    expect(state.context.activePlayerID).toBe('333')

    expect(state.context.players[1].stageCards).toEqual([])
    expect(state.context.stageCardsDeck).toEqual([10, 11, 12, 13])
  })
  service.send('MOVE', { playerID: '222' })
})

test('stage deck empty, get no card', async () => {
  const service = await testHelpers.getService('rolled_to_land_on_free_stage_deck_empty')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[1].positionInfo.square).toBe(10)

    expect(state.value).toBe('rolling')
    expect(state.context.activePlayerID).toBe('333')

    expect(state.context.players[1].stageCards).toEqual([])
    expect(state.context.stageCardsDeck).toEqual([])
  })
  service.send('MOVE', { playerID: '222' })
})

test('stage deck empty, get one by shuffling discard pile', async () => {
  const service = await testHelpers.getService('rolled_to_land_on_free_stage_deck_empty_reshuffle')
  _.shuffle.mockReturnValue([13, 10, 12, 11])
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[1].positionInfo.square).toBe(10)

    expect(_.shuffle.mock.calls[0][0]).toEqual([10, 11, 12, 13])
    expect(state.context.players[1].stageCards).toEqual([11])
    expect(state.context.stageCardsDeck).toEqual([13, 10, 12])
    expect(state.context.stageCardsDiscarded).toEqual([])
  })
  service.send('MOVE', { playerID: '222' })
})
