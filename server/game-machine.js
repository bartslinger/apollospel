const { Machine, assign } = require('xstate')
var _ = require('lodash')
const squares = require('./squares')
const stageCards = require('./stage-cards')

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

const nextPlayerID = (context, playerID) => {
  // loop through players
  for (const i in context.players) {
    if (context.players[i].id === playerID) {
      const next = context.players[parseInt(i) + 1]
      return next ? next.id : context.players[0].id
    }
  }
  return '222'
}

const playerIDFromIndex = (context, index) => {
  var playerID = context.players[index].id
  return playerID
}

const nextPlayerIndex = (context, currentIndex) => {
  return (currentIndex + 1) % context.players.length
}

const nextBiddingPlayerIndex = (context, currentIndex) => {
  const start = currentIndex
  var next = nextPlayerIndex(context, currentIndex)
  while (true) {
    if (next === start) {
      return -1
    }
    if (context.players[next].passed === false) {
      return next
    }
    next = nextPlayerIndex(context, next)
  }
}

const getStageDeck = (stageCards) => {
  var ids = []
  for (const i in stageCards) {
    const card = stageCards[i]
    if (card.position === 'stack') {
      ids.push(parseInt(i))
    }
  }
  return ids
}

const stageCardsToTable = (stageCards, numberToDraw) => {
  // get cards on deck
  const deckCardIds = getStageDeck(stageCards)
  const drawnCardIds = _.sampleSize(deckCardIds, 3)
  for (const i in drawnCardIds) {
    console.log(drawnCardIds[i])
    stageCards[drawnCardIds[i]].position = 'table'
  }

  console.log(stageCards)
  return stageCards
}

const drawStageCardForPlayer = (context, stageCards, playerIndex) => {
  const deckCardIds = getStageDeck(stageCards)
  const drawnCardId = _.sample(deckCardIds)
  if (drawnCardId === undefined) return stageCards

  stageCards[drawnCardId].position = 'player'
  stageCards[drawnCardId].playerID = playerIDFromIndex(context, playerIndex)
  return stageCards
}

const gameMachine = Machine({
  id: 'gameMachine',
  initial: 'initializing',
  context: {
    players: [],
    activePlayerID: '',
    // activePlayerIndex: 0,
    dieRoll: -1,
    test: '',
    sponsorHatOwner: '',
    auctionMaster: '2',
    auctionBiddingIndex: -1,
    stageCards: []
  },
  on: {
    REGISTER_PLAYER: {
      actions: 'registerPlayer'
    },
    REMOVE_PLAYER: {
      actions: 'removePlayer'
    },
    MOVE_PLAYER: {
      actions: 'movePlayer'
    }
  },
  states: {
    initializing: {
      entry: [
        assign({ stageCards: stageCards })
      ],
      on: {
        '': {
          target: 'rolling'
        }
      }
    },
    auctionDrawingCards: {
      on: {
        DRAW_CARDS_FOR_AUCTION: {
          target: 'auctionBidding',
          actions: [
            'drawCardsForAuction',
            'resetPlayersPassed',
            'setBiddingIndexToAuctionMaster'
          ],
          cond: 'playerIsAuctionMaster'
        }
      }
    },
    auctionBidding: {
      on: {
        PLACE_BID: {

        },
        PASS: {

        }
      }
    },
    rolling: {
      on: {
        ROLL: {
          target: 'afterRoll',
          actions: 'dieRoll',
          cond: 'isPlayersTurn'
        }
      }
    },
    afterRoll: {
      on: {
        MOVE: {
          target: 'executingSquareAction',
          actions: 'movePlayer',
          cond: 'isPlayersTurn'
        }
      }
    },
    executingSquareAction: {
      on: {
        '': [
          {
            target: 'launchingOrMoney',
            actions: 'drawStageCard',
            cond: 'onFreeStageSquare'
          },
          {
            target: 'rolling',
            cond: 'onThrowAgainSquare'
          },
          {
            target: 'launchingOrMoney',
            actions: 'claimSponsorHat',
            cond: 'onSponsorSquare'
          },
          {
            target: 'launchingOrMoney'
          }
        ]
      }
    },
    launchingOrMoney: {
      on: {
        '': {
          target: 'continueNextPlayer',
          actions: 'chooseMoney'
        }
      }
    },
    rollingForLaunch: {
      on: {
        ROLL: {
          target: 'attemptedLaunch',
          actions: 'dieRoll',
          cond: 'isPlayersTurn'
        }
      }
    },
    attemptedLaunch: {

    },
    continueNextPlayer: {
      on: {
        '': {
          target: 'rolling',
          actions: 'activateNextPlayer'
        }
      }
    }
  }
}, {
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
        activePlayerID = nextPlayerID(context, activePlayerID)
      }
      const playerIndex = indexFromPlayerID(context, event.playerID)
      players.splice(playerIndex, 1)
      return {
        players: players,
        activePlayerID: activePlayerID
      }
    }),
    dieRoll: assign({
      dieRoll: (context, event) => event.value
    }),
    movePlayer: assign((context, event) => {
      var players = context.players
      return {
        players: players
      }
    }),
    activateNextPlayer: assign({
      activePlayerIndex: (context, event) => {
        // How many players are there?
        const numberOfPlayers = context.players.length
        return (context.activePlayerIndex + 1) % numberOfPlayers
      }
    }),
    drawCardsForAuction: assign((context, event) => {
      const newStageCards = stageCardsToTable(context.stageCards, 3)
      return {
        stageCards: newStageCards
      }
    }),
    resetPlayersPassed: assign((context, event) => {
      var players = JSON.parse(JSON.stringify(context.players))
      for (const i in players) {
        players[i].passed = false
      }
      return {
        players: players
      }
    }),
    setBiddingIndexToAuctionMaster: assign((context, event) => {
      return {
        auctionBiddingIndex: indexFromPlayerID(context, context.auctionMaster)
      }
    }),
    drawStageCard: assign((context, event) => {
      return {
        stageCards: drawStageCardForPlayer(context, context.stageCards, context.activePlayerIndex)
      }
    }),
    claimSponsorHat: assign((context, event) => {
      const playerID = playerIDFromIndex(context, context.activePlayerIndex)
      return {
        sponsorHatOwner: playerID
      }
    }),
    chooseMoney: assign((context, event) => {
      var players = JSON.parse(JSON.stringify(context.players))
      var newMoney = 100
      if (playerIDFromIndex(context, context.activePlayerIndex) === context.sponsorHatOwner) {
        newMoney = 150
      }
      players[context.activePlayerIndex].money += newMoney

      return {
        players: players
      }
    }),
    launchAttempt: assign((context, event) => {
      var players = JSON.parse(JSON.stringify(context.players))
      // get dieRoll
      return {
        players: players
      }
    })
  },
  guards: {
    isPlayersTurn: (context, event) => {
      return context.activePlayerID === event.playerID
    },
    playerIsAuctionMaster: (context, event) => {
      if (context.auctionMaster !== event.playerID) {
        console.log('PLAYER IS NOT AUCTION MASTER')
      }
      return context.auctionMaster === event.playerID
    },
    onFreeStageSquare: (context, event) => {
      const position = context.players[context.activePlayerIndex].positionInfo
      console.log('on', squares.getType(position.ring, position.square))
      return squares.getType(position.ring, position.square) === squares.Types.FREE_STAGE
    },
    onThrowAgainSquare: (context, event) => {
      const position = context.players[context.activePlayerIndex].positionInfo
      return squares.getType(position.ring, position.square) === squares.Types.THROW_AGAIN
    },
    onSponsorSquare: (context, event) => {
      const position = context.players[context.activePlayerIndex].positionInfo
      return squares.getType(position.ring, position.square) === squares.Types.SPONSOR
    }
  }
})

module.exports = gameMachine
