const jwt = require('jsonwebtoken');
// const process.env.JWT_SECRET = 'Sample@Secret123$'

const fetchuser = (req, res, next) => {
    const token = req.header('authToken')
    if(!token) {
        return res.status(400).json({message: "Enter valid token"})
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET)
        req.user = data.user
        // console.log(req.user)
        next();
    } catch (error) {
        res.status(401).send({error: error.message})
    }
}

module.exports = fetchuser