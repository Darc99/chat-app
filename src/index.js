const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words')

const {generateMsg, generateLocation} = require('./utils/messages');

const app = express();
const server = http.createServer(app)
const io = socketio(server);

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New websocket connection');

    socket.emit('message', generateMsg('Welcome!'))
    socket.broadcast.emit('message', generateMsg('A new user has joined!'))

    socket.on('sendMsg', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.emit('message', generateMsg(message))
        callback("Delivered!")
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMsg', generateLocation(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMsg('A user has left'))
    })

})

server.listen(port, () => {
    console.log("Running on port " + port);
})