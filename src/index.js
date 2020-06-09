const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser,getUser,removeUser,getUsersInRoom } = require('./utils/users')


const PORT = process.env.PORT

const publicDir = path.join(__dirname,'../public')


const app = express()
const Server = http.createServer(app)
const io = socketio(Server)
const Filter = require('bad-words')

app.use(express.static(publicDir)) 

io.on('connection', (socket)=>{
    console.log('new connection!');
    
    

    socket.on('sendMessage',(msg, cb)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return cb('Profanity not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,msg))
        cb('Delivered!')
    })


    socket.on('join', ({username,room}, cb) =>{
        const {error, user } = addUser({
            id: socket.id,
            username,
            room
        })

        if(error){ return cb(error) }


        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username,`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        cb()
    })

    socket.on('sendLocation', (coords, cb)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.lat},${coords.lon}`))
        if(!coords){
            return cb('No location')
        }
        cb()
    })

    socket.on('geoFailed', (msg)=>{
        socket.emit('message', generateMessage(user.username,msg))
    })
   
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){ io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))}
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        }) 
    })
})




Server.listen(PORT, ()=>{
    console.log(`Process listening on port ${process.env.PORT}`);
    
})
