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
    expect(state.context.players[0].positionInfo.orbit).toBe(0)
    expect(state.context.players[0].positionInfo.square).toBe(5)
    expect(state.context.players[0].money).toBe(100)
    expect(state.context.eventInfo).toEqual({
      type: 'move',
      playerIndex: 0,
      fromOrbit: 0,
      toOrbit: 0,
      fromSquare: 2,
      toSquare: 5
    })
  })
  service.send('MOVE', { playerID: '111' })
})

test('player moves through start line and gets money', async () => {
  const service = await testHelpers.getService('four_players_first_rolled_to_cross_start')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.orbit).toBe(0)
    expect(state.context.players[0].positionInfo.square).toBe(1)
    expect(state.context.players[0].money).toBe(400) // already had 100, get 300
  })
  service.send('MOVE', { playerID: '111' })
})

test('player moves through start line in second orbit and gets money', async () => {
  const service = await testHelpers.getService('four_players_first_rolled_to_cross_start_second_orbit')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.orbit).toBe(1)
    expect(state.context.players[0].positionInfo.square).toBe(1)
    expect(state.context.players[0].money).toBe(300) // already had 100, get 200
  })
  service.send('MOVE', { playerID: '111' })
})

test('player moves through start line in third orbit and gets money', async () => {
  const service = await testHelpers.getService('four_players_first_rolled_to_cross_start_third_orbit')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.orbit).toBe(2)
    expect(state.context.players[0].positionInfo.square).toBe(1)
    expect(state.context.players[0].money).toBe(200) // already had 100, get 100
  })
  service.send('MOVE', { playerID: '111' })
})

test('player hits first barrier', async () => {
  const service = await testHelpers.getService('rolled_one_while_on_first_barrier')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.orbit).toBe(0)
    expect(state.context.players[0].positionInfo.square).toBe(8)
    expect(state.context.players[0].money).toBe(100)
  })
  service.send('MOVE', { playerID: '111' })
})

test('player hits second barrier', async () => {
  const service = await testHelpers.getService('rolled_one_while_on_second_barrier')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[0].positionInfo.orbit).toBe(0)
    expect(state.context.players[0].positionInfo.square).toBe(18)
    expect(state.context.players[0].money).toBe(100)
  })
  service.send('MOVE', { playerID: '111' })
})

test('last player moved, continue to auction', async () => {
  const service = await testHelpers.getService('last_player_rolled_to_land_on_barrier')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.value).toBe('auctionTurningCards')

    // replenish grid
    expect(state.context.stageCardsGrid).toEqual([14, 13, 16, 12, 18])
    expect(state.context.stageCardsDeck).toEqual([10, 11])
  })
  service.send('MOVE', { playerID: '444' })
})

test('last player moved, no stage cards left, continue launch or money', async () => {
  const service = await testHelpers.getService('last_player_rolled_to_land_on_barrier_stack_depleted')
  service.onTransition(state => {
    if (state.changed === undefined) return

    // skip the auction because there are no cards
    expect(state.value).toBe('launchOrMoney')
  })
  service.send('MOVE', { playerID: '444' })
})
