const express = require('express');
const path = require("path");
const fs = require('fs');
const bodyParser = require('body-parser');
const pgp = require('pg-promise');
const {
  db
} = require('./pgp');
//
const cors = require('cors');
//
// graphQL
const expressGraphQL = require('express-graphql')
const schema = require('./schema.js')
//
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// })

// CORS to help cross-origin requests
app.use(cors()); // for both '/api' and 'graphql'

// Import API Routes

const api = require('./api/index.js')(express, app)
app.use('/api', api)

const root = {
  hello: () => 'Hello GraphQL!'
};

app.use('/graphql', expressGraphQL({
  schema: schema,
  rootValue: root, // schema can access rootValue
  pretty: true,
  graphiql: true // can use graphical IDE to test
}))

// Database Listen the server
const server = app.listen(port, host, () => {
  console.log('Server listening on ' + host + ':' + port)
})