const testHelpers = require('./test-helpers')

test('player gets the sponsor hat', async () => {
  const service = await testHelpers.getService('rolled_to_land_on_sponsor')
  service.onTransition(state => {
    if (state.changed === undefined) return
    expect(state.context.players[1].positionInfo.square).toBe(13)

    expect(state.context.sponsorHatOwner).toBe('222')
    expect(state.value).toBe('rolling')
    expect(state.context.activePlayerID).toBe('333')
  })
  service.send('MOVE', { playerID: '222' })
})
