module.exports = {
  deriveClientState: (state, playerID) => {
    const clientState = {
      playerInfos: [],
      yourPlayerIndex: -1,
      activePlayerIndex: -1,
      sponsorIndex: -1,
      auctionMasterIndex: -1,
      gamePhase: state.value,
      dieRoll: state.context.dieRoll,
      stageCardsGrid: [],
      eventInfo: {}
    }

    if (state.event === 'MOVE') {
      clientState.eventInfo = state.context.eventInfo
    }

    clientState.stageCardsGrid = state.context.stageCardsGrid.map(
      (val) => val >= 0
    )
    console.log(clientState.stageCardsGrid)
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
    }
    return clientState
  }
}
