const clients = {}

const add = (socket) => {
  // if (!clients[randomId]) {
  //   clients[randomId] = {
  //     name: name,
  //     money: 100,
  //     position: {
  //       ring: 0,
  //       field: 0
  //     }
  //   }
  // }
  clients[socket.id] = {
    playerID: null,
    socket: socket
  }
  printClients()
}

const remove = (socket) => {
  delete clients[socket.id]
  printClients()
}

const printClients = () => {
  for (const i in clients) {
    console.log(i, '=>', clients[i].playerID)
  }
}

module.exports = {
  clients,
  add,
  remove
}
