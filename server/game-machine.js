const { Machine } = require('xstate')

const gameMachineConfig = require('./game-machine-config')

const STAGECARDS_GRID_SIZE = 12

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
    auctionBiddingID: '',
    stageCards: [],
    stageCardsDeck: [],
    stageCardsDiscarded: [],
    stageCardsGrid: Array(STAGECARDS_GRID_SIZE).fill(-1),
    stageCardsGridMask: Array(STAGECARDS_GRID_SIZE).fill(false),
    stageCardsForAuction: [],
    eventInfo: {
      type: ''
    }
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
        'initializeStageCards'
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
            target: 'auctionTurningCards',
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
            target: 'auctionTurningCards',
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
            target: 'turningFreeStage',
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
    turningFreeStage: {
      entry: [
        'replenishGrid'
      ],
      on: {
        TURN_STAGE_CARD: {
          target: 'collectingFreeStage',
          actions: 'turnStageCard'
        }
      }
    },
    collectingFreeStage: {
      on: {
        COLLECT_STAGE_CARDS: {
          target: 'checkAllPlayersRolled',
          actions: 'collectStageCard'
        }
      }
    },
    checkAllPlayersRolled: {
      on: {
        '': [
          {
            target: 'auctionTurningCards',
            cond: 'isLastPlayer'
          },
          {
            target: 'rolling',
            actions: 'activateNextPlayer'
          }
        ]
      }
    },
    auctionTurningCards: {
      entry: [
        'replenishGrid'
      ],
      on: {
        '': [
          {
            target: 'launchOrMoney',
            cond: 'gridDepleted'
          },
          {
            target: 'auctionCollectingCards',
            cond: 'allAuctionCardsTurned'
          }
        ],
        TURN_STAGE_CARD: {
          actions: 'turnStageCard'
        }
      }
    },
    auctionCollectingCards: {
      on: {
        COLLECT_STAGE_CARDS: {
          target: 'auctionBidding',
          actions: 'collectStageCardsForAuction'
        }
      }
    },
    auctionBidding: {
      entry: [
        'auctionBiddingEntry'
      ],
      on: {
        '': {
          target: 'auctionCollectingCardsAfterBidding',
          cond: 'allPlayersPassed'
        },
        PLACE_BID: {
          actions: 'placeBid'
        },
        PASS: {
          actions: 'passBid'
        }
      }
    },
    auctionCollectingCardsAfterBidding: {
      on: {
        COLLECT_AFTER_AUCTION: {
          target: 'launchOrMoney',
          actions: 'collectCardsAfterBidding'
        }
      }
    },
    launchOrMoney: {

    }
  }
}, gameMachineConfig)

module.exports = gameMachine
