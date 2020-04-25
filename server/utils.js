const { ValidationError } = require('./error')

const validateCallback = (cb) => {
  if (typeof cb !== 'function') {
    cb = () => { }
    // console.log('cb !== function, replaced with ()=>{}')
  }
  return cb
}

// Checks the data-types of the request, modifies if necessary
const validateData = (data) => {
  if (typeof data === 'string') {
    if (data === '') {
      data = {}
    } else {
      try {
        data = JSON.parse(data)
      } catch (err) {
        return { err: new ValidationError(err.message + ', input was: "' + data + '"'), data: null }
      }
    }
  }

  if (!(typeof data === 'object')) {
    return { err: new ValidationError('Expected an object, got ' + (typeof data)), data: null }
  }

  return { err: null, validatedData: data }
}

module.exports = {
  validateCallback,
  validateData
}
