const clients = {}

clients.random_id = { clientId: 123 }

const connectClient = (socket, randomId, name) => {
  if (!clients[randomId]) {
    clients[randomId] = {
      name: name,
      money: 100,
      position: {
        ring: 0,
        field: 0
      }
    }
  }
  clients[randomId].socketId = socket.id
}

module.exports = {
  clients,
  connectClient
}
