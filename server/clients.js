const clients = {}

const registerClient = (socket, randomId, name) => {
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
  clients[randomId].socket = socket
}

module.exports = {
  clients,
  registerClient
}
