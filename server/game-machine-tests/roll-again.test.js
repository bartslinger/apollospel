const testHelpers = require('./test-helpers')

test('player lands on roll again', async () => {
  const service = await testHelpers.getService('rolled_to_land_on_throw_again')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[1].positionInfo.square).toBe(6)

    expect(state.value).toBe('rolling')
    expect(state.context.activePlayerID).toBe('222')
  })
  service.send('MOVE', { playerID: '222' })
})
