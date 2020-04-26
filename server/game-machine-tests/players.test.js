const testHelpers = require('./test-helpers')

test('new player joins the game', async () => {
  const service = await testHelpers.getService('no_players')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players.length).toBe(1)
    expect(state.context.players[0].name).toBe('Bart')
    expect(state.context.players[0].id).toBe('123')
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

test('player leaves while rolling', async () => {
  expect(true).toBe(false)
})
