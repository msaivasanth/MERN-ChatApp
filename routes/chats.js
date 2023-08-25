const express = require('express')
const router = express.Router();
const Chat = require('../models/chatModel')
const fetchuser = require('../middleware/fetchuser');
const User = require('../models/userModel');

// Route 1: Access Chat from a single user
router.post('/accessChat/:id', fetchuser, async (req, res) => {
    const userId = req.params.id;
    console.log(userId)
    
    if(!userId) {
        console.log("userId param not sent with request")
        return res.sendStatus(400)
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: {$elemMatch: { $eq: req.user.id } } },
            { users: {$elemMatch: { $eq: userId } } },
        ]
    }).populate('users', '-password').populate('latestMessage')

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    })

    if(isChat.length > 0) { res.send(isChat[0]) }
    else {
        console.log(req.user.id);
        let chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user.id, userId]
        }

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            
            res.status(200).send(FullChat)
        } catch (error) {
            return res.send(error.message)
        }
    }
})

//Route 2: Fetch all Chats releated to a single user
router.get('/fetchChats', fetchuser, async (req, res) => {
    try {
        Chat.find({users: { $elemMatch: { $eq: req.user.id } } })
        .populate("users", "-password")
        .populate('groupAdmin', '-password')
        .populate('latestMessage')
        .sort({ updatedAt: -1})
        .then( async (results) => {
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name pic email"
            });

            res.send(results)
        })
    } catch (error) {
        return res.send(error.message)
    }
})

// Route 3: Creates group chat 
router.post('/createGroupChat', fetchuser, async (req, res) => {
    // console.log(req.body.users)
    if(!req.body.users || !req.body.name) {
        return res.send( { message: "Enter all the feilds" });
    }

    const users = JSON.parse(req.body.users);
    if(users.length < 2) {
        return res.send({ message: "More than 2 users are required to form a group chat"})
    }

    users.push(req.user.id);
    // console.log(users)

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user.id
        })

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate('users', '-password')
        .populate('groupAdmin', '-password')


        res.send(fullGroupChat);
        console.log(fullGroupChat)
    } catch (error) {
        return res.send(error.message)
    }

})

//Route 4: Re-naming group name
router.put('/renameGroupChat', fetchuser, async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId, { chatName }, { new: true}
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

    if(!updatedChat) return res.send("Chat Not Found")
    else res.json(updatedChat)
})

//Route 5: Add users to group
router.put('/addToGroup', fetchuser, async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId, { $push: { users: userId} }, { new: true }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

    if(!removed) return res.send("Chat Not Found")
    else res.json(removed)
})

//Route 6: Remove from Group
router.put('/removeFromGroup', fetchuser, async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId, { $pull: { users: userId} }, { new: true }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

    if(!removed) return res.send("Chat Not Found")
    else res.json(removed)
})



module.exports = router;