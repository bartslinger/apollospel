const clientState = require('./client-state')

test('derive client state', () => {
  const state = {
    value: 'rolling',
    context: {
      players: [
        {
          name: 'Bart',
          id: '111',
          money: 100,
          positionInfo: {
            orbit: 0,
            square: 6
          },
          stageCards: [1, 4, 40]
        },
        {
          name: 'Baaaart',
          id: '222',
          money: 10,
          positionInfo: {
            orbit: 0,
            square: 7
          },
          stageCards: []
        }
      ],
      activePlayerID: '111',
      dieRoll: 5,
      stageCardsDeck: [],
      stageCardsDiscarded: [],
      stageCardsGrid: [-1, -1, 10, -1, 9, 12, 11],
      stageCardsGridMask: [false, false, true, false, false, false, false],
      stageCardsForAuction: [1, 2, 0],
      sponsorHatOwner: '222',
      auctionMaster: '111',
      auctionBiddingID: '222',
      auctionBids: [
        {
          value: 0,
          playerID: ''
        },
        {
          value: 0,
          playerID: ''
        },
        {
          value: 90,
          playerID: '222'
        }
      ],
      eventInfo: {
        type: 'move',
        playerIndex: 1,
        fromOrbit: 0,
        toOrbit: 1,
        fromSquare: 10,
        toSquare: 11
      }
    },
    event: {
      type: 'MOVE'
    }
  }

  const clientStateUpdate = clientState.deriveClientState(state, '222')

  expect(clientStateUpdate.eventInfo).toEqual({
    type: 'move',
    playerIndex: 1,
    fromOrbit: 0,
    toOrbit: 1,
    fromSquare: 10,
    toSquare: 11
  })
  expect(clientStateUpdate.playerInfos).toEqual([
    {
      name: 'Bart',
      money: 100,
      positionInfo: {
        orbit: 0,
        square: 6
      },
      stageCards: [1, 4, 40]
    },
    {
      name: 'Baaaart',
      money: 10,
      positionInfo: {
        orbit: 0,
        square: 7
      },
      stageCards: []
    }
  ])

  expect(clientStateUpdate.auctionBids).toEqual([
    {
      value: 0,
      playerIndex: -1
    },
    {
      value: 0,
      playerIndex: -1
    },
    {
      value: 90,
      playerIndex: 1
    }
  ])
  expect(clientStateUpdate.stageCardsForAuction).toEqual([1, 2, 0])
  expect(clientStateUpdate.stageCardsGrid).toEqual([-2, -2, 10, -2, -1, -1, -1])
  expect(clientStateUpdate.yourPlayerIndex).toBe(1)
  expect(clientStateUpdate.activePlayerIndex).toBe(0)
  expect(clientStateUpdate.sponsorIndex).toBe(1)
  expect(clientStateUpdate.auctionMasterIndex).toBe(0)
  expect(clientStateUpdate.auctionBiddingIndex).toBe(1)
  expect(clientStateUpdate.gamePhase).toBe('rolling')
  expect(clientStateUpdate.dieRoll).toBe(5)
})
