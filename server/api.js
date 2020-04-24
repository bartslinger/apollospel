const objectPath = require('object-path')
const clients = require('./clients')

module.exports = {
  registerClient: (socket, data) => {
    const id = objectPath.get(data, 'clientID')
    const name = objectPath.get(data, 'clientName')
    clients.registerClient(socket, id, name)
  }
}
