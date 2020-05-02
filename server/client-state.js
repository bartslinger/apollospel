const objectPath = require('object-path')

const indexFromPlayerID = (context, playerID) => {
  var index = -1
  for (const i in context.players) {
    const player = context.players[i]
    if (player.id === playerID) {
      index = parseInt(i)
    }
  }
  return index
}

module.exports = {
  deriveClientState: (state, playerID) => {
    const clientState = {
      playerInfos: [],
      yourPlayerIndex: -1,
      activePlayerIndex: -1,
      sponsorIndex: -1,
      auctionMasterIndex: -1,
      auctionBiddingIndex: -1,
      gamePhase: state.value,
      dieRoll: state.context.dieRoll,
      stageCardsGrid: [],
      stageCardsForAuction: state.context.stageCardsForAuction,
      eventInfo: {}
    }

    const eventType = objectPath.get(state, 'event.type')

    const eventsWithData = [
      'MOVE',
      'TURN_STAGE_CARD'
    ]
    if (eventsWithData.indexOf(eventType) !== -1) {
      clientState.eventInfo = state.context.eventInfo
    }

    clientState.stageCardsGrid = state.context.stageCardsGrid.map(
      (v, i) => {
        return v >= 0 ? (state.context.stageCardsGridMask[i] ? v : -1) : -2
      }
    )

    clientState.auctionBids = []
    for (const i in state.context.auctionBids) {
      const bid = state.context.auctionBids[i]
      clientState.auctionBids.push({
        value: bid.value,
        playerIndex: indexFromPlayerID(state.context, bid.playerID)
      })
    }

    for (const playerIndex in state.context.players) {
      const player = state.context.players[playerIndex]
      const playerInfo = {
        name: player.name,
        money: player.money,
        positionInfo: player.positionInfo,
        stageCards: player.stageCards
      }
      clientState.playerInfos.push(playerInfo)

      if (player.id === playerID) {
        clientState.yourPlayerIndex = parseInt(playerIndex)
      }

      if (player.id === state.context.activePlayerID) {
        clientState.activePlayerIndex = parseInt(playerIndex)
      }

      if (player.id === state.context.auctionMaster) {
        clientState.auctionMasterIndex = parseInt(playerIndex)
      }

      if (player.id === state.context.sponsorHatOwner) {
        clientState.sponsorIndex = parseInt(playerIndex)
      }

      if (player.id === state.context.auctionBiddingID) {
        clientState.auctionBiddingIndex = parseInt(playerIndex)
      }
    }
    return clientState
  }
}
