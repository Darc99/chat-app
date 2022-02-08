const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words')

const {generateMsg, generateLocation} = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server);

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New websocket connection');

    // socket.emit('message', generateMsg('Welcome!'))
    // socket.broadcast.emit('message', generateMsg('A new user has joined!'))

    socket.on('join', ({username,room}, callback) => {
        const { error, user } = addUser({id: socket.id, username, room}) 

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMsg('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMsg('Admin',`${user.username} has joined`))
        
        //to display users available 
        io.to(user.room).emit('roomInfo', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMsg', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMsg(user.username, message))
        callback("Delivered!")
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMsg', generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMsg('Admin', `${user.username} has left!`))        
            io.to(user.room).emit('roomInfo', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

})

server.listen(port, () => {
    console.log("Running on port " + port);
})