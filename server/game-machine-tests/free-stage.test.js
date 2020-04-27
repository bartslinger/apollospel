const testHelpers = require('./test-helpers')

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
