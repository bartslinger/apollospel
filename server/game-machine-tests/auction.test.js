const testHelpers = require('./test-helpers')
const _ = require('lodash')
jest.mock('lodash')

test('turn a stage card', async () => {
  const service = await testHelpers.getService('auction_master_drawing_cards')
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(state.value).toBe('auctionTurningCards')
    expect(state.context.stageCardsGrid).toEqual([17, 18, 19, 20, 21])
    expect(state.context.stageCardsGridMask).toEqual([false, true, false, false, false])
  })
  service.send('TURN_STAGE_CARD', { playerID: '444', cardGridIndex: 1 })
})

test('turn third stage card and proceed to collect', async () => {
  const service = await testHelpers.getService('auction_master_drawing_third_card')
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(state.value).toBe('auctionCollectingCards')
    expect(state.context.stageCardsGridMask).toEqual([true, true, false, true, false])
  })

  service.send('TURN_STAGE_CARD', { playerID: '444', cardGridIndex: 3 })
})

test('collect cards for the auction from grid', async () => {
  const service = await testHelpers.getService('auction_master_collecting_cards_from_grid')
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(state.context.stageCardsGridMask).toEqual([false, false, false, false, false])
    expect(state.context.stageCardsGrid).toEqual([-1, -1, 19, -1, 21])
    expect(state.context.stageCardsForAuction).toEqual([17, 18, 20])

    // ready for the bidding phase
    expect(state.value).toBe('auctionBidding')
    expect(state.context.players[0].passed).toBe(false)
    expect(state.context.players[1].passed).toBe(false)
    expect(state.context.players[2].passed).toBe(false)
    expect(state.context.players[3].passed).toBe(false)
    expect(state.context.auctionBiddingID).toBe('444')
  })
  service.send('COLLECT_STAGE_CARDS', { playerID: '444' })
})

test('place first bid', async () => {
  const service = await testHelpers.getService('auction_start_first_bid')
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(state.context.auctionBids[0].value).toBe(0)
    expect(state.context.auctionBids[0].playerID).toBe('')
    expect(state.context.auctionBids[1].value).toBe(100)
    expect(state.context.auctionBids[1].playerID).toBe('444')
    expect(state.context.auctionBids[2].value).toBe(0)
    expect(state.context.auctionBids[2].playerID).toBe('')
    expect(state.context.auctionBiddingID).toBe('222') // 111 has passed already
    expect(state.context.players[3].money).toBe(900)
  })
  service.send('PLACE_BID', { playerID: '444', cardLocationIndex: 1, value: 100 })
})

test('last player passes', async () => {
  const service = await testHelpers.getService('auction_last_bidder_passes')
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(state.context.players[0].passed).toBe(true)
    expect(state.context.players[1].passed).toBe(true)
    expect(state.context.players[2].passed).toBe(true)
    expect(state.context.players[3].passed).toBe(true)
    expect(state.value).toBe('auctionCollectingCardsAfterBidding')
  })
  service.send('PASS', { playerID: '333' })
})

test('distribute cards after everyone passes', async () => {
  const service = await testHelpers.getService('auction_collecting_cards')
  service.onTransition(state => {
    if (state.changed === undefined) return

    expect(state.value).toBe('rolling')
    expect(state.context.players[3].stageCards).toEqual([17])
    expect(state.context.stageCardsDiscarded).toEqual([14, 15, 16, 18, 20])
  })
  service.send('COLLECT_AFTER_AUCTION', { playerID: '444' })
})
