const express = require('express');
const passport = require('passport');
const jwt      = require('jsonwebtoken');
const router = express.Router();
const User  = require('../models/user');




function verifyToken (req, res, next){
    if(!req.headers.authorization){
        res.status(401).json({success: false, message: 'Un Authorized Access'})
    }
    let token = req.headers.authorization.split(' ')[1];
    if(token === 'null'){
        res.status(401).json({success: false, message: 'Un Authorized Access'})
    }
    let payload = jwt.verify(token, 'secretkey')
    if(!payload){
        res.status(401).json({success: false, message: 'Un Authorized Access'})
    }
    req.userId = payload.subject;
    next();
}





// ==================
// Register New User
// ==================


router.post('/register', async(req, res) => {
    try{
        const {email,username, password} = req.body;
        const user = new User ({email, username});
        const registerUser = await User.register(user, password);
        // For JWT Token
        let payload = { subject: registerUser._id};
        let token   = jwt.sign(payload, 'secretkey');
        return res.status(200).json({code: 200, message: 'User Register Successfully.', token: token});
        
    }catch(e){
        return res.status(440).json({code: 400, message: e.message});
    }

});
// ==============
// Get All Users
// =============
router.get('/users', async(req, res) => {
    const users = await User.find({});
    return res.json(users);
});

// =================
// Get Login User 
// =================
router.get('/profile', verifyToken ,(req , res) => {
    User.findOne({_id: req.userId}).select('username email').exec((err, user) => {
        if(err){
            res.json({success: false, message: err})
        }else{
            if(!user){
                res.json({success: false, message: 'User Not Found'})
            }else{
                res.json({success: true, User: user})
            }
        }
    })
})


// ===========
// Login User
// ===========

router.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect: '/campgrounds'}) ,async(req ,res) => {
   try{
    const { email, username } = req.body;
    const user = await User.findOne({ username });

    // JWT TOKEN
    let payload = {subject: user._id};
    let token   = jwt.sign(payload, 'secretkey'); 
    if(token){
        return res.status(200).json({code:200,  message: 'You Are Log In Successfully', user:user, token: token});
    }else{
        return res.status(200).json({code:400,  message: 'Invalid User Name Or Password'});
    }
   }catch(e){
    return res.status(440).json({code: 400, message: e.message});
   }
    
})


module.exports = router;
// exports.verifyToken = verifyToken;
