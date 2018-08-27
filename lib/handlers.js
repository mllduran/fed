'use strict';
const config = require('./config');
const _data = require('./data');
const helpers = require('./helpers');

// Define Handlers
const handlers = {};

handlers.users = (data, callback) => {
  let accceptedMethods = ['get', 'post', 'put', 'delete'];
  if (accceptedMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

handlers._users.get = (data, callback) => {
  let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length > 10 ? data.queryStringObject.phone.trim() : false;

  if (phone) {
    let token = typeof(data.headers.token) === 'string' && data.headers.token.length === 20 ? data.headers.token : false;

    if (token) {
      handlers._tokens.verify(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          _data.read('users', phone, (err, data) => {
            if (!err && data) {
              delete data.hashedPassword;
              callback(200, data);
            } else {
              callback(404)
            }
          });
        } else {
          callback(400, {error: 'Invalid token'})
        }
      });
    } else {
      callback(400, {error: 'Missing required field'});
    }
  } else {
    callback(400, {error: 'Missing required filed'});
  }
};

handlers._users.post = (data, callback) => {
  let firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  let tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    let token = typeof(data.headers.token) === 'string' && data.headers.token.length === 20 ? data.headers.token : false;

    if (token) {
      handlers._tokens.verify(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          _data.read('users', phone, (err) => {
            if (err) {
              // Hash password
              let hashedPassword = helpers.hash(password);
      
              if (!hashedPassword) {
                return callback(500, 'Failed to hash password');
              }
      
              // Create user object
              let userObject = {
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                hashedPassword: hashedPassword,
                tosAgreement: true
              };
      
              _data.create('users', phone, userObject, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, 'Failed to create new user');
                }
              });
            } else {
              callback(400, {error: 'User with that number already exists'});
            }
          });
        } else {
          callback(400, {error: 'Invalid token'});
        }
      });
    } else {
      callback(400, {error: 'Missing required fields'});
    }
  } else {
    callback(400, {error: 'Missing required fields'});
  }
};

handlers._users.put = (data, callback) => {
  let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 10 ? data.payload.phone.trim() : false;

  let firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone) {
    let token = typeof(data.headers.token) === 'string' && data.headers.token.length === 20 ? data.headers.token : false;

    if (token) {
      handlers._tokens.verify(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = helpers.hash(password);
              }
      
              _data.update('users', phone, userData, (err, data) => {
                if (!err && data) {
                  callback(200);
                } else {
                  callback(500, {error: 'Something went wrong'});
                }
              });
            } else {
              callback(404);
            }
          });
        } else {
          callback(400, {error: 'Invalid token'});
        }
      });
    } else {
      callback(400, {error: 'Missing required fields'});
    }
  } else {
    callback(400, {error: 'Missing required fields'});
  }
};

handlers._users.delete = (data, callback) => {
  let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 10 ? data.payload.phone.trim() : false;

  if (phone) {
    let token = typeof(data.headers.token) === 'string' && data.headers.token.length === 20 ? data.headers.token : false;

    if (token) {
      handlers._tokens.verify(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          _data.delete('users', phone, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {error: 'Something went wrong'});
            }
          });
        } else {
          callback(400, {error: 'Invalid Token'});
        }
      });
    } else {
      callback(400, {error: 'Missing required fields'});
    }
  } else {
    callback(400, {error: 'Missing required fields'});
  }
};

// Container for the tokens submethods
handlers.tokens = (data, callback) => {
  let accceptedMethods = ['get', 'post', 'put', 'delete'];
  if (accceptedMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

// Token - Get
// Required data: Token ID
// Optional data: none
handlers._tokens.get = (data, callback) => {
  let tokenId = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (tokenId) {
    _data.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {error: 'Missing required fields'});
  }
}

// Token - Post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone && password) {
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash the sent password then compare to user data
        let hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // Set token with random name
          let tokenId = helpers.createRandomString(20);
          let expires = Date.now() + 1000 * 60 *60;
          let tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires
          };

          //Store token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, {error: 'Something went wrong'});
            }
          });
        } else {
          callback(400, {error: 'Password did not match'})
        }
      } else {
        callback(400, {error: 'Could not find the specified user'});
      }
    })
  } else {
    callback(400, {error: 'Missing required fields'});
  }
};

// Token - put
// Required field: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  let tokenId = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
  let extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? true: false;

  if (tokenId && extend) {
    _data.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() * 1000 * 60 * 60;

          _data.update('tokens', tokenId, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {error: 'Something went wrong'});
            }
          });
        } else {
          callback(400, {error: 'Token already expired'});
        }
      } else {
        callback(400, {error: 'Could not find the specified token'});
      }
    });
  } else {
    callback(400, {error: 'Missing required fields'});
  }
};

handlers._tokens.delete = (data, callback) => {
  let tokenId = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;

  if (tokenId) {
    _data.delete('tokens', tokenId, (err) => {
      if (!err) {
        callback(200);
      } else {
        callback(500, {error: 'Something went wrong'});
      }
    })
  } else {
    callback(400, {error: 'Missing required fields'});
  }
};

handlers._tokens.verify = (token, phone, callback) => {
  _data.read('tokens', token, (err, tokenData) => {
    if (!err, tokenData) {
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

handlers.checks = (data, callback) => {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._checks = {};

// Chekcs - post
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
handlers._checks.post = (data, callback) => {
  let protocol = typeof(data.payload.protocol) === 'string' && ['https', 'http'].indexOf(data.payload.protocol) ? data.payload.protocol : false;
  let url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  let method = typeof(data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) ? data.payload.method : false;
  let successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
  let timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // Get token from headers
    let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

    _data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        let userPhone = tokenData.phone;

        _data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            let userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : false;

            if(userChecks.length < config.maxChecks) {
              let checkId = helpers.createRandomString(20);

              let checkObject = {
                id: checkId,
                userPhone: userPhone,
                protocol: protocol,
                url: url,
                method: method,
                successCodes: successCodes,
                timeoutSeconds: timeoutSeconds
              }

              _data.create('checks', checkId, checkObject, (err) => {
                if (!err) {
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  _data.update('users', userPhone, userData, (err) => {
                    if (!err) {
                      callback(200, checkObject);
                    } else {
                      callback(500);
                    }
                  });
                } else {
                  callback(500);
                }
              });
            } else {
              callback(400, {error: 'Max checks reached'});
            }
          } else {
            callback(403)
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400, {error: 'Missing required fileds'});
  }
};

handlers._checks.get = (data, callback) => {
  let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

        handlers._tokens.verify(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            callback(200, checkData);
          } else {
            callback(403);
          }
        });
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {error: 'Missing required fields'});
  }
};

// Checks - put
// Require data: id
// Optional data: protocol, url, method, statusCodes, timeoutSeconds
handlers._checks.put = (data, callback) => {
  let id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;

  let protocol = typeof(data.payload.protocol) === 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  let url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  let method = typeof(data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) ? data.payload.method : false;
  let successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
  let timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      _data.read('checks', id, (err, checkData) => {
        if (!err && checkData) {
          let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
          handlers._tokens.verify(token, checkData.userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              if (protocol) {
                checkData.protocol = protocol;
              }
              
              if (url) {
                checkData.url = url;
              }

              if (method) {
                checkData.method = method;
              }

              if (successCodes) {
                checkData.successCodes = successCodes;
              }

              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds;
              }

              _data.update('checks', id, checkData, (err) => {
                if (!err) {
                  callback(200)
                } else {
                  callback(500, {error: 'Something went wrong'});
                }
              });
            } else {
              callback(403)
            }
          });
        } else {
          callback(400, {error: 'CHeck ID did not exist'});
        }
      });
    } else {
      callback(400, {error: 'Missing required fields1'});
    }
  } else {
    callback(400, {error: 'Missing required fields2'});
  }
};

handlers.ping = (data, callback) => {
  callback(200);
};

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
