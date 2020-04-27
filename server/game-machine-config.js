const { assign } = require('xstate')
const squares = require('./squares')
const _ = require('lodash')

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

const getNextPlayerID = (context, playerID) => {
  // loop through players
  for (const i in context.players) {
    if (context.players[i].id === playerID) {
      const next = context.players[parseInt(i) + 1]
      return next ? next.id : context.players[0].id
    }
  }
  throw (Error('PlayerID not found'))
}

const playerIDFromIndex = (context, index) => {
  var playerID = context.players[index].id
  return playerID
}

const getActivePlayer = (context) => {
  const playerIndex = indexFromPlayerID(context, context.activePlayerID)
  return context.players[playerIndex]
}

// const getStageDeck = (stageCards) => {
//   var ids = []
//   for (const i in stageCards) {
//     const card = stageCards[i]
//     if (card.position === 'stack') {
//       ids.push(parseInt(i))
//     }
//   }
//   return ids
// }

// const stageCardsToTable = (stageCards, numberToDraw) => {
//   // get cards on deck
//   const deckCardIds = getStageDeck(stageCards)
//   const drawnCardIds = _.sampleSize(deckCardIds, 3)
//   for (const i in drawnCardIds) {
//     console.log(drawnCardIds[i])
//     stageCards[drawnCardIds[i]].position = 'table'
//   }

//   console.log(stageCards)
//   return stageCards
// }

// const drawStageCardForPlayer = (context, stageCards, playerIndex) => {
//   const deckCardIds = getStageDeck(stageCards)
//   const drawnCardId = _.sample(deckCardIds)
//   if (drawnCardId === undefined) return stageCards

//   stageCards[drawnCardId].position = 'player'
//   stageCards[drawnCardId].playerID = playerIDFromIndex(context, playerIndex)
//   return stageCards
// }

const config = {
  actions: {
    registerPlayer: assign((context, event) => {
      const playerID = event.playerID
      var players = context.players
      for (const i in players) {
        if (playerID === players[i].id) {
          // this is a match, update name
          players[i].name = event.playerName
          return { players: players }
        }
      }
      // no match, create player
      players.push({
        name: event.playerName,
        id: event.playerID,
        money: 100,
        passed: true,
        positionInfo: {
          ring: 0,
          square: 0
        }
      })

      // Just one player, become the active player
      var activePlayerID = context.activePlayerID
      if (players.length === 1) {
        activePlayerID = event.playerID
      }

      return {
        players: players,
        activePlayerID: activePlayerID
      }
    }),
    removePlayer: assign((context, event) => {
      var players = context.players
      var activePlayerID = context.activePlayerID
      if (context.activePlayerID === event.playerID) {
        activePlayerID = getNextPlayerID(context, activePlayerID)
      }
      const playerIndex = indexFromPlayerID(context, event.playerID)
      players.splice(playerIndex, 1)
      return {
        players: players,
        activePlayerID: activePlayerID
      }
    }),
    activateNextPlayer: assign((context, event) => {
      return {
        activePlayerID: getNextPlayerID(context, context.activePlayerID)
      }
    }),
    dieRoll: assign({
      dieRoll: (context, event) => event.value
    }),
    movePlayer: assign((context, event) => {
      var players = context.players
      const playerIndex = indexFromPlayerID(context, event.playerID)
      const startSquare = players[playerIndex].positionInfo.square
      var newSquare = players[playerIndex].positionInfo.square + context.dieRoll
      // Get money when crossing start
      if (newSquare > 19) {
        players[playerIndex].money += (300 - 100 * players[playerIndex].positionInfo.ring)
      }
      // First barrier
      if (startSquare <= 8 && newSquare > 8 && context.dieRoll < 2) {
        newSquare = 8
      }
      // Second barrier
      if (startSquare <= 18 && newSquare > 18 && context.dieRoll < 2) {
        newSquare = 18
      }
      newSquare %= 20
      players[playerIndex].positionInfo.square = newSquare
      return {
        players: players
      }
    }),
    shuffleStageCards: (context, event) => {
      return _.shuffle(context.stageCardsDeck.concat(context.stageCardsDiscarded))
    },
    drawStageCard: assign((context, event) => {
      var players = context.players
      var stageCardsDeck = context.stageCardsDeck
      const activePlayerIndex = indexFromPlayerID(context, context.activePlayerID)
      const card = stageCardsDeck.pop()
      players[activePlayerIndex].stageCards.push(card)
      return {
        players: players,
        stageCardsDeck: stageCardsDeck
      }
    })
    // claimSponsorHat: assign((context, event) => {
    //   const playerID = playerIDFromIndex(context, context.activePlayerIndex)
    //   return {
    //     sponsorHatOwner: playerID
    //   }
    // }),
    // chooseMoney: assign((context, event) => {
    //   var players = JSON.parse(JSON.stringify(context.players))
    //   var newMoney = 100
    //   if (playerIDFromIndex(context, context.activePlayerIndex) === context.sponsorHatOwner) {
    //     newMoney = 150
    //   }
    //   players[context.activePlayerIndex].money += newMoney

    //   return {
    //     players: players
    //   }
    // }),
    // launchAttempt: assign((context, event) => {
    //   var players = JSON.parse(JSON.stringify(context.players))
    //   // get dieRoll
    //   return {
    //     players: players
    //   }
    // })
  },
  guards: {
    isPlayersTurn: (context, event) => {
      return context.activePlayerID === event.playerID
    },
    // playerIsAuctionMaster: (context, event) => {
    //   if (context.auctionMaster !== event.playerID) {
    //     console.log('PLAYER IS NOT AUCTION MASTER')
    //   }
    //   return context.auctionMaster === event.playerID
    // },
    onFreeStageSquare: (context, event) => {
      const player = getActivePlayer(context)
      const position = player.positionInfo
      return squares.getType(position.ring, position.square) === squares.Types.FREE_STAGE
    },
    onThrowAgainSquare: (context, event) => {
      const player = getActivePlayer(context)
      const position = player.positionInfo
      return squares.getType(position.ring, position.square) === squares.Types.THROW_AGAIN
    }
    // onSponsorSquare: (context, event) => {
    //   const position = context.players[context.activePlayerIndex].positionInfo
    //   return squares.getType(position.ring, position.square) === squares.Types.SPONSOR
    // }
  }
}

module.exports = config
