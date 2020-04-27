const _ = require('lodash')

const shuffleStageCards = (context) => {
  return _.shuffle(context.stageCardsDeck.concat(context.stageCardsDiscarded))
}

module.exports = {
  shuffleStageCards
}
