const testHelpers = require('./test-helpers')

test('first player joins the game', async () => {
  const service = await testHelpers.getService('no_players')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players.length).toBe(1)
    expect(state.context.players[0].name).toBe('Bart')
    expect(state.context.players[0].id).toBe('123')

    // Expect to become the active player
    expect(state.context.activePlayerID).toBe('123')
    // And also the auction master
    expect(state.context.auctionMaster).toBe('123')
  })
  service.send('REGISTER_PLAYER', { playerID: '123', playerName: 'Bart' })
})

test('second player joins the game', async () => {
  const service = await testHelpers.getService('one_player')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players.length).toBe(2)
    expect(state.context.players[1].name).toBe('Frisse Freek')
    expect(state.context.players[1].id).toBe('63880')

    expect(state.context.activePlayerID).toBe('123')
  })
  service.send('REGISTER_PLAYER', { playerID: '63880', playerName: 'Frisse Freek' })
})

test('first player re-joins the game with new name', async () => {
  const service = await testHelpers.getService('one_player')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players.length).toBe(1)
    expect(state.context.players[0].name).toBe('Baaaaart')
    expect(state.context.players[0].id).toBe('123')
  })
  service.send('REGISTER_PLAYER', { playerID: '123', playerName: 'Baaaaart' })
})

test('player removed', async () => {
  const service = await testHelpers.getService('four_players_first_rolling')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players.length).toBe(3)
    expect(state.context.activePlayerID).toBe('111')
  })
  service.send('REMOVE_PLAYER', { playerID: '333' })
})

test('active player removed', async () => {
  const service = await testHelpers.getService('four_players_first_rolling')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players.length).toBe(3)
    expect(state.context.activePlayerID).toBe('222')
  })
  service.send('REMOVE_PLAYER', { playerID: '111' })
})

test('auction master removed', async () => {
  const service = await testHelpers.getService('four_players_first_rolling')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players.length).toBe(3)
    expect(state.context.activePlayerID).toBe('111')
    expect(state.context.auctionMaster).toBe('111')
  })
  service.send('REMOVE_PLAYER', { playerID: '444' })
})

test('last player removed', async () => {
  const service = await testHelpers.getService('one_player')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players.length).toBe(0)
  })
  service.send('REMOVE_PLAYER', { playerID: '123' })
})

// test('last player removed while rolling', async () => {
//   const service = await testHelpers.getService('four_players_last_rolling')
//   service.onTransition(state => {
//     if (state.changed === undefined) return
//     expect(state.context.players.length).toBe(3)
//     expect(state.context.activePlayerID).toBe('111')
//     expect(state.value).toBe('auctionDrawingCards')
//   })
//   service.send('REMOVE_PLAYER', { playerID: '444' })
// })
