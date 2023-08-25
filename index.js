const express = require('express')
const dotenv = require('dotenv')
const connectToMongo = require('./db')
const cors = require('cors')

const app = express()
dotenv.config();
const port = process.env.PORT || 5000;

connectToMongo()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send("hello world")
})

app.use('/api/user', require('./routes/user'))
app.use('/api/chat', require('./routes/chats'))
app.use('/api/message', require('./routes/messages'))

const server = app.listen(port, ()=> {
    console.log(`app listining to port ${port}`)
})

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000"
    }
})

io.on("connection", (socket)=> {
    console.log("Connected to socket.io")

    socket.on('setup', (userData) => {
        socket.join(userData._id)
        // console.log(userData._id);
        socket.emit('connected')
    })

    socket.on('join chat', (room)=> {
        socket.join(room)
        console.log('user joined room: ' + room)
    })

    socket.on('typing', (room) => socket.in(room).emit('typing'))
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'))

    socket.on('new message', (newMessageReceived)=> {
        var chat = newMessageReceived.chat;

        if(!chat.users) return console.log('chat.user not defined')

        chat.users.forEach(user => {
            if(user._id == newMessageReceived.sender._id) return ;

            socket.in(user._id).emit('message received', newMessageReceived)
        });
    })

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
      });
})