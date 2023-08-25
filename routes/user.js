const express = require('express')
const router = express.Router();
const User = require('../models/userModel')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

//Route 1: CREATING NEW USER
router.post('/createUser',[
    body('name', 'Enter name with length 5').isLength({min: 5}),
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Enter name with length 5').isLength({min: 5})
], async (req, res) => {
    const result = validationResult(req);
    let success = false;
    if(!result.isEmpty()) {
        return res.status(400).json({error: result.array()})
    }

    try {
        // This also returns a promise, we bring the response from db based on entered email
        let user = await User.findOne({email: req.body.email})
    
        // Here we check whether the entered user email id is already present in db or not
        if(user) {
           return res.status(400).json({message: "User already exits"})
        }
    
        // Here we add salt to the given password and generate hash which gives more security to our details.
        const salt = await bcrypt.genSalt(10)
        const secPassword = await bcrypt.hash(req.body.password, salt)
    
        // Here the data gets added into the data base, it returns a promise
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPassword,
            pic: req.body.pic
        })
        
        //Add it jwt and helps to verify the token
        const data = {
            user: {
                id: user.id
            } 
        }
    
        // This token is generated for each user
        const authToken = jwt.sign(data, process.env.JWT_SECRET)
        success = true
        res.json({success, authToken})
        
    } catch (error) {
        console.log(error.message) 
        return res.status(500).json({error: "Internal Server error"})
    }
})


//Route 2: LOGIN USER
router.post('/login', [
    body('email', 'Enter valid email').isEmail(),
    body('password', 'length must be more than 5'),
], async (req, res) => {
    let success = false;
    const result = validationResult(req);
    if(!result.isEmpty()) {
        return res.status(400).json({error: result.array()})
    }

    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({message: "Enter correct email"})
        }
        
        // Here we compare the entered password with password present in db
        const passwordcheck = await bcrypt.compare(password, user.password)
        if(!passwordcheck) {
            return res.status(400).json({message: "Enter correct password"})
        }
        // console.log("Completed")
        const data = {
            user: {
                id: user.id
            } 
        }
        
        success = true
        const authToken = jwt.sign(data, process.env.JWT_SECRET)
        res.send({success, authToken})
        
    } catch (error) {
        console.log(error.message)
        res.status(500).json({error: "Internal Server error"})
    }
})

// Route 3: Search user from db
router.get("/fetchUsers?", fetchuser, async (req, res) => {
    // console.log(req.query.search)
    const key = req.query.search ? {
        $or: [
            {name: {$regex: req.query.search, $options: "i"} },
            {email: {$regex: req.query.search, $options: "i"} },
        ]
    }: {}

    const users = await User.find(key).select('-password').find({ _id: { $ne: req.user._id } })
    res.send(users)
})

// Route 4: retriving user credentials
router.get('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id
        const data = await User.findById(userId).select('-password')
        res.send(data)    
    } catch (error) {
        // console.log(error)
        res.status(500).send("Internal server error")
    }
})
module.exports = router