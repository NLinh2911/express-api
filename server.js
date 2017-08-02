const express = require('express');
const path = require("path");
const fs = require('fs');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const pgp = require('pg-promise');
const {db} = require('./pgp');

const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Database

// Import API Routes
const api = require('./api/index.js')(express, app)
app.use('/api', api)

// Listen the server
const server = app.listen(port, host, () => {
  console.log('Server listening on ' + host + ':' + port)
})

// Socket
// storing data in a json file for data persistence
const messageData = require('./messages.json');
//
const io = socket(server);
// socket in namespace 'socket'
io
  .of('/socket')
  .on('connection', (socket) => {
    console.log('Socket connection success: ', socket.id);
    socket.emit('connection', {title: 'Welcome to Vue Socket chat'})
    // Handle chat event
    socket.on('enter chat room', (user) => {
      console.log(`${user} enters chat room`);
      socket.emit('enter chat room', messageData)
    })
    socket.on('chat', (data) => {
      console.log(data);
      // store data in json file
      messageData.push(data)
      fs.writeFile('messages.json', JSON.stringify(messageData, null, 2), (err) => {
        console.log(err);
      })
      // data contains username and message server now emits the data to all connected
      // clients
      socket
        .broadcast
        .emit('chat', data);
    });

  });
