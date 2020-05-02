const Types = {
  AUCTION_CARD: 'auctionCard',
  SPONSOR: 'sponsor',
  SABOTAGE: 'sabotage',
  FREE_STAGE: 'freeStage',
  ALIEN_INVASION: 'alianInvasion',
  RANDOM_EVENT_CARD: 'randomEventCard',
  BARRIER: 'barrier',
  FREE_LAUNCH: 'freeLaunch',
  METEOR: 'meteor',
  STAGE_SWAP: 'stageSwap',
  THROW_AGAIN: 'throwAgain'
}

const squares = [
  [
    Types.AUCTION_CARD,
    Types.RANDOM_EVENT_CARD,
    Types.SABOTAGE,
    Types.SPONSOR,
    Types.AUCTION_CARD,
    Types.FREE_LAUNCH,
    Types.THROW_AGAIN,
    Types.SABOTAGE,
    Types.BARRIER,
    Types.RANDOM_EVENT_CARD,
    Types.FREE_STAGE,
    Types.RANDOM_EVENT_CARD,
    Types.SABOTAGE,
    Types.SPONSOR,
    Types.AUCTION_CARD,
    Types.FREE_LAUNCH,
    Types.THROW_AGAIN,
    Types.SABOTAGE,
    Types.BARRIER,
    Types.RANDOM_EVENT_CARD
  ],
  [
    Types.AUCTION_CARD,
    Types.RANDOM_EVENT_CARD,
    Types.SABOTAGE,
    Types.SPONSOR,
    Types.AUCTION_CARD,
    Types.METEOR,
    Types.THROW_AGAIN,
    Types.SABOTAGE,
    Types.BARRIER,
    Types.RANDOM_EVENT_CARD,
    Types.FREE_STAGE,
    Types.RANDOM_EVENT_CARD,
    Types.SABOTAGE,
    Types.SPONSOR,
    Types.AUCTION_CARD,
    Types.STAGE_SWAP,
    Types.THROW_AGAIN,
    Types.SABOTAGE,
    Types.BARRIER,
    Types.RANDOM_EVENT_CARD
  ],
  [
    Types.AUCTION_CARD,
    Types.RANDOM_EVENT_CARD,
    Types.ALIEN_INVASION,
    Types.SPONSOR,
    Types.AUCTION_CARD,
    Types.METEOR,
    Types.THROW_AGAIN,
    Types.ALIEN_INVASION,
    Types.BARRIER,
    Types.RANDOM_EVENT_CARD,
    Types.FREE_STAGE,
    Types.RANDOM_EVENT_CARD,
    Types.ALIEN_INVASION,
    Types.SPONSOR,
    Types.AUCTION_CARD,
    Types.STAGE_SWAP,
    Types.THROW_AGAIN,
    Types.ALIEN_INVASION,
    Types.BARRIER,
    Types.RANDOM_EVENT_CARD
  ]
]

module.exports = {
  Types,
  getType: (orbit, square) => {
    return squares[orbit][square]
  }
}
