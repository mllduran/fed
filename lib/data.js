/**
 * Library for storing and editing data
 */

// Dependencies
const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');

const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(lib._formatFilename(dir, file), 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      let stringData = JSON.stringify(data);

      //Write to file and close it
      fs.writeFile(fileDescriptor, stringData, () => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      })
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
};

lib.read = (dir, file, callback) => {
  fs.readFile(lib._formatFilename(dir, file), 'utf8', (err, data) => {
    callback(err, helpers.parseJsonToObject(data));
  });
};

lib.update = (dir, file, data, callback) => {
  fs.open(lib._formatFilename(dir, file), 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      var stringData = JSON.stringify(data);

      fs.truncate(fileDescriptor, (err) => {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing file');
                }
              })
            } else {
              callback('Error writing to file');
            }
          });
        }
      })
    } else {
      callback('Could not open the file for updating, it may not exist yet');
    }
  })
}

lib.delete = (dir, file, callback) => {
  fs.unlink(lib._formatFilename(dir, file), (err) => {
    if(!err) {
      callback(false);
    } else {
      callback('Error deleting file');
    }
  });
}

lib._formatFilename = (dir, filename) => {
  return `${lib.baseDir}${dir}/${filename}.json`
};

module.exports = lib;
