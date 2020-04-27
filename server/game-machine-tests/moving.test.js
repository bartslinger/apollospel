const testHelpers = require('./test-helpers')

test('player rolls', async () => {
  const service = await testHelpers.getService('four_players_last_rolling')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.dieRoll).toBe(3)
    expect(state.value).toBe('afterRoll')
  })
  service.send('ROLL', { playerID: '444', value: 3 })
})

test('player rolls while not active', async () => {
  const service = await testHelpers.getService('four_players_last_rolling')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.dieRoll).toBe(-1)
    expect(state.value).toBe('rolling')
  })
  service.send('ROLL', { playerID: '333', value: 3 })
})

test('player moves after roll', async () => {
  const service = await testHelpers.getService('four_players_first_has_rolled')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.ring).toBe(0)
    expect(state.context.players[0].positionInfo.square).toBe(5)
    expect(state.context.players[0].money).toBe(100)
  })
  service.send('MOVE', { playerID: '111' })
})

test('player moves through start line and gets money', async () => {
  const service = await testHelpers.getService('four_players_first_rolled_to_cross_start')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.ring).toBe(0)
    expect(state.context.players[0].positionInfo.square).toBe(1)
    expect(state.context.players[0].money).toBe(400) // already had 100, get 300
  })
  service.send('MOVE', { playerID: '111' })
})

test('player moves through start line in second ring and gets money', async () => {
  const service = await testHelpers.getService('four_players_first_rolled_to_cross_start_second_ring')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.ring).toBe(1)
    expect(state.context.players[0].positionInfo.square).toBe(1)
    expect(state.context.players[0].money).toBe(300) // already had 100, get 200
  })
  service.send('MOVE', { playerID: '111' })
})

test('player moves through start line in third ring and gets money', async () => {
  const service = await testHelpers.getService('four_players_first_rolled_to_cross_start_third_ring')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.ring).toBe(2)
    expect(state.context.players[0].positionInfo.square).toBe(1)
    expect(state.context.players[0].money).toBe(200) // already had 100, get 100
  })
  service.send('MOVE', { playerID: '111' })
})

test('player hits first barrier', async () => {
  const service = await testHelpers.getService('rolled_one_while_on_first_barrier')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.ring).toBe(0)
    expect(state.context.players[0].positionInfo.square).toBe(8)
    expect(state.context.players[0].money).toBe(100)
  })
  service.send('MOVE', { playerID: '111' })
})

test('player hits second barrier', async () => {
  const service = await testHelpers.getService('rolled_one_while_on_second_barrier')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.ring).toBe(0)
    expect(state.context.players[0].positionInfo.square).toBe(18)
    expect(state.context.players[0].money).toBe(100)
  })
  service.send('MOVE', { playerID: '111' })
})
