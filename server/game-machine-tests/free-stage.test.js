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
    expect(state.context.stageCardsGrid).toEqual([14, 15, 13, 17, 18])
    expect(state.context.stageCardsDeck).toEqual([10, 11, 12])
    expect(state.context.players[1].stageCards).toEqual([16])
  })
  service.send('COLLECT_STAGE_CARDS', { playerID: '222' })
})

test('collect a free stage card, deck empty so reshuffle discard pile', async () => {
  const service = await testHelpers.getService('free_stage_after_turning_card_deck_empty')
  _.shuffle.mockReset()
  _.shuffle.mockReturnValueOnce([13, 10, 12, 11])
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(_.shuffle.mock.calls[0][0]).toEqual([10, 11, 12, 13])
    expect(state.value).toBe('rolling')
    expect(state.context.activePlayerID).toBe('333')
    expect(state.context.stageCardsGridMask).toEqual([false, false, false, false, false])
    expect(state.context.stageCardsGrid).toEqual([14, 15, 11, 17, 18])
    expect(state.context.stageCardsDeck).toEqual([13, 10, 12])
    expect(state.context.stageCardsDiscarded).toEqual([])
    expect(state.context.players[1].stageCards).toEqual([16])
  })
  service.send('COLLECT_STAGE_CARDS', { playerID: '222' })
})

// test('player does not get a free stage', async () => {
//   const service = await testHelpers.getService('rolled_to_land_on_barrier')
//   service.onTransition(state => {
//     if (state.changed === undefined) return
//     expect(state.context.players[1].positionInfo.square).toBe(8)

//     expect(state.value).toBe('rolling')
//     expect(state.context.activePlayerID).toBe('333')

//     expect(state.context.players[1].stageCards).toEqual([])
//     expect(state.context.stageCardsDeck).toEqual([10, 11, 12, 13])
//   })
//   service.send('MOVE', { playerID: '222' })
// })

// test('stage deck empty, get no card', async () => {
//   const service = await testHelpers.getService('rolled_to_land_on_free_stage_deck_empty')
//   service.onTransition(state => {
//     if (state.changed === undefined) return
//     expect(state.context.players[1].positionInfo.square).toBe(10)

//     expect(state.value).toBe('rolling')
//     expect(state.context.activePlayerID).toBe('333')

//     expect(state.context.players[1].stageCards).toEqual([])
//     expect(state.context.stageCardsDeck).toEqual([])
//   })
//   service.send('MOVE', { playerID: '222' })
// })

// test('stage deck empty, get one by shuffling discard pile', async () => {
//   const service = await testHelpers.getService('rolled_to_land_on_free_stage_deck_empty_reshuffle')
//   _.shuffle.mockReturnValue([13, 10, 12, 11])
//   service.onTransition(state => {
//     if (state.changed === undefined) return
//     expect(state.context.players[1].positionInfo.square).toBe(10)

//     expect(_.shuffle.mock.calls[0][0]).toEqual([10, 11, 12, 13])
//     expect(state.context.players[1].stageCards).toEqual([11])
//     expect(state.context.stageCardsDeck).toEqual([13, 10, 12])
//     expect(state.context.stageCardsDiscarded).toEqual([])
//   })
//   service.send('MOVE', { playerID: '222' })
// })
