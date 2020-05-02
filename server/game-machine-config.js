const { assign } = require('xstate')
const squares = require('./squares')
const gameMachineHelpers = require('./game-machine-helpers')
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
    initializeStageCards: assign((context, event) => {
      const shuffled = _.shuffle(Array(44).fill(0).map((v, i) => i))
      return {
        stageCardsGrid: shuffled.slice(0, 12),
        stageCardsDeck: shuffled.slice(12)
      }
    }),
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
        positionInfo: {
          orbit: 0,
          square: 0
        },
        stageCards: []
      })

      // Just one player, become the active player
      var activePlayerID = context.activePlayerID
      var auctionMaster = context.auctionMaster
      if (players.length === 1) {
        activePlayerID = event.playerID
        auctionMaster = event.playerID
      }

      return {
        players: players,
        activePlayerID: activePlayerID,
        auctionMaster: auctionMaster
      }
    }),
    removePlayer: assign((context, event) => {
      var players = context.players
      var activePlayerID = context.activePlayerID
      var auctionMaster = context.auctionMaster
      if (context.activePlayerID === event.playerID) {
        activePlayerID = getNextPlayerID(context, activePlayerID)
      }
      if (context.auctionMaster === event.playerID) {
        auctionMaster = getNextPlayerID(context, auctionMaster)
      }
      const playerIndex = indexFromPlayerID(context, event.playerID)
      // last player rolling
      players.splice(playerIndex, 1)
      return {
        players: players,
        activePlayerID: activePlayerID,
        auctionMaster: auctionMaster
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
        players[playerIndex].money += (300 - 100 * players[playerIndex].positionInfo.orbit)
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
        players: players,
        eventInfo: {
          type: 'move',
          playerIndex: playerIndex,
          fromOrbit: players[playerIndex].positionInfo.orbit,
          toOrbit: players[playerIndex].positionInfo.orbit,
          fromSquare: startSquare,
          toSquare: newSquare
        }
      }
    }),
    turnStageCard: assign((context, event) => {
      var stageCardsGridMask = context.stageCardsGridMask
      if (stageCardsGridMask[event.cardGridIndex] !== undefined) {
        stageCardsGridMask[event.cardGridIndex] = true
      }
      return {
        stageCardsGridMask: stageCardsGridMask,
        eventInfo: {
          type: 'turnCard',
          turnCardIndex: event.cardGridIndex
        }
      }
    }),
    collectStageCard: assign((context, event) => {
      const playerIndex = indexFromPlayerID(context, event.playerID)
      var players = context.players
      var stageCardsDeck = context.stageCardsDeck
      var stageCardsGrid = context.stageCardsGrid
      var stageCardsGridMask = context.stageCardsGridMask

      for (const i in stageCardsGridMask) {
        if (stageCardsGridMask[i]) {
          stageCardsGridMask[i] = false
          players[playerIndex].stageCards.push(stageCardsGrid[i])
          stageCardsGrid[i] = -1
          // add a card from the deck to the grid
          const newCard = stageCardsDeck.pop()
          if (newCard) {
            stageCardsGrid[i] = newCard
          }
          break
        }
      }
      return {
        players: players,
        stageCardsDeck: stageCardsDeck,
        stageCardsGrid: stageCardsGrid,
        stageCardsGridMask: stageCardsGridMask
      }
    }),
    drawStageCard: assign((context, event) => {
      var players = context.players
      var stageCardsDeck = context.stageCardsDeck
      var stageCardsDiscarded = context.stageCardsDiscarded
      const activePlayerIndex = indexFromPlayerID(context, context.activePlayerID)
      const card = stageCardsDeck.pop()
      if (card) {
        players[activePlayerIndex].stageCards.push(card)
      } else if (stageCardsDiscarded.length > 0) {
        // shuffle the deck and try again
        stageCardsDeck = gameMachineHelpers.shuffleStageCards(context)
        stageCardsDiscarded = []
        const card = stageCardsDeck.pop()
        players[activePlayerIndex].stageCards.push(card)
      }
      return {
        players: players,
        stageCardsDeck: stageCardsDeck,
        stageCardsDiscarded: stageCardsDiscarded
      }
    }),
    claimSponsorHat: assign((context, event) => {
      return {
        sponsorHatOwner: context.activePlayerID
      }
    }),
    drawCardsForAuction: assign((context, event) => {
      var stageCardsDeck = context.stageCardsDeck
      var stageCardsForAuction = []
      var i = 0
      for (i; i < 3; i++) {
        const stageCard = stageCardsDeck.pop()
        if (!stageCard) break
        stageCardsForAuction.push({
          card: stageCard,
          bidder: null,
          value: 0
        })
      }
      if (i < 3) {
        stageCardsDeck = gameMachineHelpers.shuffleStageCards(context)
      }
      for (i; i < 3; i++) {
        const stageCard = stageCardsDeck.pop()
        if (!stageCard) break
        stageCardsForAuction.push({
          card: stageCard,
          bidder: null,
          value: 0
        })
      }
      return {
        stageCardsDeck: stageCardsDeck,
        stageCardsForAuction: stageCardsForAuction
      }
    })
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
    isLastPlayer: (context, event) => {
      return indexFromPlayerID(context, context.activePlayerID) === context.players.length - 1
    },
    noStageCardsInStock: (context, event) => {
      return context.stageCardsDeck.length + context.stageCardsDiscarded.length === 0
    },
    onFreeStageSquare: (context, event) => {
      const player = getActivePlayer(context)
      const position = player.positionInfo
      return squares.getType(position.orbit, position.square) === squares.Types.FREE_STAGE
    },
    onThrowAgainSquare: (context, event) => {
      const player = getActivePlayer(context)
      const position = player.positionInfo
      return squares.getType(position.orbit, position.square) === squares.Types.THROW_AGAIN
    },
    onSponsorSquare: (context, event) => {
      const player = getActivePlayer(context)
      const position = player.positionInfo
      return squares.getType(position.orbit, position.square) === squares.Types.SPONSOR
    }
  }
}

module.exports = config
