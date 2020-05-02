
var cards = []

module.exports = cards

var i
// generate cards
for (i = 0; i < 6; i++) {
  for (var j = 0; j < 5; j++) {
    var price = 30
    if (i > 1) price = 40
    if (i > 3) price = 50
    cards.push({
      price: price,
      values: [i]
    })
  }
}

for (i = 0; i < 3; i++) {
  cards.push({
    price: 60,
    values: [0, 1]
  })
}

for (i = 0; i < 3; i++) {
  cards.push({
    price: 70,
    values: [2, 3]
  })
}

for (i = 0; i < 3; i++) {
  cards.push({
    price: 80,
    values: [4, 5]
  })
}

cards.push({
  price: 100,
  values: [0, 1, 2]
})
cards.push({
  price: 100,
  values: [0, 1, 2]
})

cards.push({
  price: 120,
  values: [3, 4, 5]
})
cards.push({
  price: 120,
  values: [3, 4, 5]
})

cards.push({
  price: 150,
  values: [0, 1, 2, 3, 4, 5]
})
