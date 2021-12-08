if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
  }



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const User = require('./models/user');
const jwt  = require('jsonwebtoken')
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


app.use(session(sessionConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: 'http://localhost:4200' }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, PublicKey"
    );
    next();
});

// ======================
// For Login Use Of App
// ======================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new  LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// =====================
// Data Base Connection
// ====================
mongoose.connect('mongodb://localhost:27017/YelpCampImageUpload', {
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


app.get('/', (req, res) => {
    res.send('Welcome To Yelp Camp');
})

app.listen(3000, () => {
    console.log('Server Start On Port 3000');
})