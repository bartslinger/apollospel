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
            target: 'continueNextPlayer',
            actions: 'drawStageCard',
            cond: 'onFreeStageSquare'
          },
          {
            target: 'rolling',
            cond: 'onThrowAgainSquare'
          },
          {
            target: 'continueNextPlayer'
          }
        ]
      }
      // on: {
      //   '': [
      //     {
      //       target: 'launchingOrMoney',
      //       actions: 'drawStageCard',
      //       cond: 'onFreeStageSquare'
      //     },
      //     {
      //       target: 'rolling',
      //       cond: 'onThrowAgainSquare'
      //     },
      //     {
      //       target: 'launchingOrMoney',
      //       actions: 'claimSponsorHat',
      //       cond: 'onSponsorSquare'
      //     },
      //     {
      //       target: 'launchingOrMoney'
      //     }
      //   ]
      // }
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
}, gameMachineConfig)

module.exports = gameMachine
