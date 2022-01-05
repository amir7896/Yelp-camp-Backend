if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
  }

const port = process.env.PORT || 8080;
const dbcon = process.env.DB;


const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/user');
const jwt  = require('jsonwebtoken')
const path = require('path');
// ==================
// Require For Login 
// ==================
const passport = require('passport');
const LocalStrategy =  require('passport-local');

// ========================================
// Routes For Hnadling The Functionaliteis
// ========================================
const campgroundRoutes = require('./routes/campgroounds');
const reviewRoutes = require('./routes/review');
const userRoutes  = require('./routes/user');
const resetRoutes  = require('./routes/resetPassword');

const app = express();


// =======================
// Session Configuration
// =======================
const sessionConfig = {
    secret: "Thisinnotagoodsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expired: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
// =====================
// Data Base Connection
// ====================
mongoose.connect(dbcon, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
   
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Data Base Connected Successfully!');
});

// Static files
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));
// Angular app
app.get('*', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../frontend/dist/frontend/index.html')
    );
});


app.use(session(sessionConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// ======================
// For Login Use Of App
// ======================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new  LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// ================================================
// Fake User For Checking our passport Work Or not
// ================================================
// app.get('/fakeuser', async(req,res) => {
//     const user = new User({
//         email: 'amir@gmail.com',
//         username: 'amir'
//     });
//     const newUser = await User.register(user, 'noor');
//     res.send(newUser);
// });

// =====================
// Use Routes Directory
// =====================
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/resetPass', resetRoutes);


app.listen(port, () => {
    console.log('Server Start On Port 8080');
})