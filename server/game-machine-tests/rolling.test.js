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

// test('player moves after roll', async () => {
//   const service = await testHelpers.getService('four_players_first_has_rolled')
//   service.onTransition(state => {
//     if (state.changed === undefined) return
//   })
//   service.send('MOVE', { playerID: '111' })
// })
