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
      stageCardsForAuction: [],
      stageCardsGrid: [-1, -1, 10, -1, 9, 12, 11],
      sponsorHatOwner: '222',
      auctionMaster: '111',
      eventInfo: {
        type: 'move',
        playerIndex: 1,
        fromOrbit: 0,
        toOrbit: 1,
        fromSquare: 10,
        toSquare: 11
      }
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
  expect(clientStateUpdate.stageCardsGrid).toEqual([false, false, true, false, true, true, true])
  expect(clientStateUpdate.yourPlayerIndex).toBe(1)
  expect(clientStateUpdate.activePlayerIndex).toBe(0)
  expect(clientStateUpdate.sponsorIndex).toBe(1)
  expect(clientStateUpdate.auctionMasterIndex).toBe(0)
  expect(clientStateUpdate.gamePhase).toBe('rolling')
  expect(clientStateUpdate.dieRoll).toBe(5)
})
