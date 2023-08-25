const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');


router.post('/sendMessage', fetchuser, async (req, res) => {
    const { content, chatId } = req.body
    
    if(!content || !chatId) {
        return res.status(400).send("Invalid data passed into request")
    }


    let newMessage = {
        sender: req.user.id,
        content: content,
        chat: chatId
    }

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic")
        message = await message.populate("chat")
        message = await User.populate(message, {
            path: 'chat.users',
            select: "name pic email"
        })

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        })

        res.json(message)
    } catch (error) {
        return res.status(400).send(error.message)
    }
})

router.get('/allMessages/:chatId', fetchuser, async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate("chat")
        
        res.json(messages)
    } catch (error) {
        return res.status(400).json(error.message)
    }
})
module.exports = router