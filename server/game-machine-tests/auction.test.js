const testHelpers = require('./test-helpers')
const _ = require('lodash')
jest.mock('lodash')

test('turn a stage card', async () => {
  const service = await testHelpers.getService('auction_master_drawing_cards')
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(state.value).toBe('auctionTurningCards')
    // expect(state.context.activePlayerID).toBe('444')
    expect(state.context.stageCardsGridMask).toEqual([false, true, false, false, false])
  })
  service.send('TURN_STAGE_CARD', { playerID: '444', cardGridIndex: 1 })
})

// test('draw three cards', async () => {
//   const service = await testHelpers.getService('auction_master_drawing_cards')
//   service.onTransition(state => {
//     if (state.changed === undefined) return
//     expect(state.context.stageCardsForAuction).toEqual([
//       {
//         card: 13,
//         bidder: null,
//         value: 0
//       },
//       {
//         card: 12,
//         bidder: null,
//         value: 0
//       },
//       {
//         card: 11,
//         bidder: null,
//         value: 0
//       }
//     ])
//     expect(state.context.stageCardsDeck).toEqual([10])
//     expect(state.value).toBe('auctionBidding')
//   })
//   service.send('DRAW_CARDS', { playerID: '444' })
// })

// test('draw three cards reshuffle', async () => {
//   const service = await testHelpers.getService('auction_master_drawing_cards_reshuffle')
//   _.shuffle.mockReset()
//   _.shuffle.mockReturnValueOnce([14, 12, 15, 13])
//   service.onTransition(state => {
//     if (state.changed === undefined) return
//     expect(_.shuffle.mock.calls[0][0]).toEqual([12, 13, 14, 15])
//     expect(state.context.stageCardsForAuction).toEqual([
//       {
//         card: 11,
//         bidder: null,
//         value: 0
//       },
//       {
//         card: 13,
//         bidder: null,
//         value: 0
//       },
//       {
//         card: 15,
//         bidder: null,
//         value: 0
//       }
//     ])
//     expect(state.context.stageCardsDeck).toEqual([14, 12])
//     expect(state.value).toBe('auctionBidding')
//   })
//   service.send('DRAW_CARDS', { playerID: '444' })
// })

// test('draw only 1 card because none are left', async () => {
//   const service = await testHelpers.getService('auction_master_drawing_cards_reshuffle_one_left')
//   _.shuffle.mockReset()
//   _.shuffle.mockReturnValueOnce([14])
//   service.onTransition(state => {
//     if (state.changed === undefined) return
//     expect(_.shuffle.mock.calls[0][0]).toEqual([14])
//     expect(state.context.stageCardsForAuction).toEqual([
//       {
//         card: 14,
//         bidder: null,
//         value: 0
//       }
//     ])
//     expect(state.context.stageCardsDeck).toEqual([])
//     expect(state.value).toBe('auctionBidding')
//   })
//   service.send('DRAW_CARDS', { playerID: '444' })
// })
