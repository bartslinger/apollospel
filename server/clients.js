const clients = {}

const add = (socket) => {
  clients[socket.id] = {
    playerID: null,
    socket: socket
  }
}

const remove = (socket) => {
  delete clients[socket.id]
}

module.exports = {
  clients,
  add,
  remove
}
