'use strict';
/**
 * Pirmary file for the API
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const handlers = require('./lib/handlers');
const router = require('./lib/router');
const helpers = require('./lib/helpers');
const config = require('./lib/config');


// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
  unifedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
  console.log(`Server running at ${config.envName} listening at port ${config.httpPort}`);
});

// Instantiate the HTTPS server
// const httpsServerOptions = {
//   key: fs.readFileSync('./https/key.pem'),
//   cert: fs.readFileSync('./https/cert.pem')
// };
// const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
//   unifedServer(req, res);
// });

// httpsServer.listen(config.httpsPort, () => {
//   console.log(`Server running at ${config.envName} listening at port ${config.httpsPort}`);
// });

const unifedServer = (req, res) => {
  // Get url and prase
  /**
   * The url.parsed second parameter is set to true this will use 
   * querystring module then transform all query string to an object.
   */
  let parsedUrl = url.parse(req.url, true);

  // Get path
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get query string as an object
  let queryStringObject = parsedUrl.query;

  // Get Method
  let method = req.method.toLowerCase();

  // Get headers
  let headers = req.headers;

  // Get payload
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // Choose handler to use, not found? use not found handler
    let choosenHandler = typeof(router[trimmedPath])!== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Consturct the data object to send to handler
    let data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
    choosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      payload = typeof(payload) === 'object' ? payload : {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log('Response: ' + payloadString);
    });
  });
};

