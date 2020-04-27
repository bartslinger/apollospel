const { Machine, assign } = require('xstate')
var _ = require('lodash')

const stageCards = require('./stage-cards')
const gameMachineConfig = require('./game-machine-config')

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
    rolling: {
      on: {
        ROLL: {
          target: 'afterRoll',
          actions: 'dieRoll',
          cond: 'isPlayersTurn'
        },
        REMOVE_PLAYER: [
          {
            target: 'auctionDrawingCards',
            actions: 'removePlayer',
            cond: 'isLastPlayer'
          },
          {
            target: 'rolling',
            actions: 'removePlayer'
          }
        ]
      }
    },
    afterRoll: {
      on: {
        MOVE: {
          target: 'executingSquareAction',
          actions: 'movePlayer',
          cond: 'isPlayersTurn'
        },
        REMOVE_PLAYER: [
          {
            target: 'auctionDrawingCards',
            actions: 'removePlayer',
            cond: 'isLastPlayer'
          },
          {
            target: 'rolling',
            actions: 'removePlayer'
          }
        ]
      }
    },
    executingSquareAction: {
      on: {
        '': [
          {
            target: 'checkAllPlayersRolled',
            actions: 'drawStageCard',
            cond: 'onFreeStageSquare'
          },
          {
            target: 'rolling',
            cond: 'onThrowAgainSquare'
          },
          {
            target: 'checkAllPlayersRolled',
            actions: 'claimSponsorHat',
            cond: 'onSponsorSquare'
          },
          {
            target: 'checkAllPlayersRolled'
          }
        ]
      }
    },
    checkAllPlayersRolled: {
      on: {
        '': [
          {
            target: 'auctionDrawingCards',
            cond: 'isLastPlayer'
          },
          {
            target: 'rolling',
            actions: 'activateNextPlayer'
          }
        ]
      }
    },
    auctionDrawingCards: {
      on: {
        '': {
          target: 'launchOrMoney',
          cond: 'noStageCardsInStock'
        },
        DRAW_CARDS: {
          target: 'auctionBidding',
          actions: 'drawCardsForAuction'
        }
      }
    },
    auctionBidding: {

    },
    launchOrMoney: {

    }
  }
}, gameMachineConfig)

module.exports = gameMachine
