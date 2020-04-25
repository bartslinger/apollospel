class ValidationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ValidationError'
    this.message = message
  }

  toJSON () {
    return {
      name: this.name,
      message: this.message
    }
  }
}

class PermissionError extends Error {
  constructor (message) {
    super(message)
    this.name = 'PermissionError'
    this.message = message
  }

  toJSON () {
    return {
      name: this.name,
      message: this.message
    }
  }
}

class StateError extends Error {
  constructor (message) {
    super(message)
    this.name = 'StateError'
    this.message = message
  }

  toJSON () {
    return {
      name: this.name,
      message: this.message
    }
  }
}

module.exports = {
  ValidationError,
  PermissionError,
  StateError
}
