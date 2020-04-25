const { Machine, assign } = require('xstate')
var _ = require('lodash')
const squares = require('./squares')
const stageCards = require('./stage-cards')

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

const gameMachine = Machine({
  id: 'gameMachine',
  initial: 'initializing',
  context: {
    players: [],
    activePlayer: 0,
    dieRoll: -1,
    test: '',
    sponsorHatOwner: '',
    auctionMaster: '1',
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
          target: 'auctionDrawingCards'
        }
      }
    },
    auctionDrawingCards: {
      on: {
        DRAW_CARDS_FOR_AUCTION: {
          target: 'auctionBidding',
          actions: 'drawCardsForAuction',
          cond: 'playerIsAuctionMaster'
        }
      }
    },
    auctionBidding: {

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
          target: 'continueNextPlayer',
          actions: 'movePlayer',
          cond: 'isPlayersTurn'
        }
      }
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
    registerPlayer: assign({
      players: (context, event) => {
        const playerID = event.playerID
        var players = JSON.parse(JSON.stringify(context.players))
        for (const i in players) {
          if (playerID === players[i].id) {
          // this is a match, update name
            players[i].name = event.playerName
            return players
          }
        }
        // no match, create player
        players.push({
          name: event.playerName,
          id: event.playerID,
          money: 100,
          positionInfo: {
            ring: 0,
            square: 0
          }
        })
        return players
      }
    }),
    removePlayer: assign((context, event) => {
      console.log(event)
      const playerID = event.playerID
      var players = JSON.parse(JSON.stringify(context.players))
      var newActivePlayer = context.activePlayer

      for (const i in players) {
        if (playerID === players[i].id) {
          // match, remove this one
          players.splice(i, 1)
          console.log('active player: ', context.activePlayer, 'i:', i)
          if (context.activePlayer > parseInt(i)) {
            console.log('PLAYERREMOVED BIGGER PLAYER ID')
            newActivePlayer -= 1
          }
          if (players.length > 0) {
            newActivePlayer %= (players.length)
          } else {
            newActivePlayer = 0
          }
        }
      }
      return {
        players: players,
        activePlayer: newActivePlayer

      }
    }),
    dieRoll: assign({
      dieRoll: (context, event) => event.value
    }),
    movePlayer: assign({
      players: (context, event) => {
        // event has the playerID and number of steps
        var players = JSON.parse(JSON.stringify(context.players))
        for (const i in players) {
          if (context.activePlayer.toString() === i) {
            const before = players[i].positionInfo.square
            var after = players[i].positionInfo.square + context.dieRoll
            const crossOne = (before <= 8 && after > 8)
            const crossTwo = (before <= 18 && after > 18)
            if (crossOne && context.dieRoll < 2) {
              after = 8
            }
            if (crossTwo && context.dieRoll < 2) {
              after = 18
            }
            players[i].positionInfo.square = after
            players[i].positionInfo.square %= 20
            break
          }
        }
        return players
      }
    }),
    activateNextPlayer: assign({
      activePlayer: (context, event) => {
        // How many players are there?
        const numberOfPlayers = context.players.length
        return (context.activePlayer + 1) % numberOfPlayers
      }
    }),
    drawCardsForAuction: assign((context, event) => {
      const newStageCards = stageCardsToTable(context.stageCards, 3)
      return {
        stageCards: newStageCards
      }
    })
  },
  guards: {
    isPlayersTurn: (context, event) => {
      if (context.players[context.activePlayer].id !== event.playerID) {
        console.log('NOT PLAYER TURNNNNNN ')
      }
      return context.players[context.activePlayer].id === event.playerID
    },
    playerIsAuctionMaster: (context, event) => {
      if (context.auctionMaster !== event.playerID) {
        console.log('PLAYER IS NOT AUCTION MASTER')
      }
      return context.auctionMaster === event.playerID
    }
  }
})

module.exports = gameMachine
