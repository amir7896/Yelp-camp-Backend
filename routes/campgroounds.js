if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
  }

const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const jwt  = require('jsonwebtoken');
const User = require('../models/user');
const multer = require('multer');
const {storage} = require('../cloudinary');
const cloudinary = require('cloudinary');
const mapbxGeoCodeing = require('@mapbox/mapbox-sdk/services/geocoding');


// Map box Token
const mapBoxToken = process.env.MAP_TOKEN;
const geocoder = mapbxGeoCodeing({accessToken: mapBoxToken});

// File upload settings  

// const PATH = './uploads';


let upload = multer({
  storage: storage
});

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


// ===================
// Get All Campgrounds
// ===================
router.get('/',async(req, res) => {
    const campgrounds = await Campground.find({}).sort({'_id': -1});
    res.json(campgrounds);
});

// =====================
// Add Campgroound in DB
// =====================
router.post('/', verifyToken, upload.array('images') ,async(req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    console.log('Geometry Data =',geoData.body.features[0].geometry);
    const campground = new Campground({
        title: req.body.title,
        images: req.body.images,
        location: req.body.location,
        price: req.body.price,
        description: req.body.description,
    });
    console.log('added camp  Body =', campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.userId;
    campground.images = req.files.map( f =>  ({url: f.path, filename: f.filename}));

    await campground.save((err, doc) => {
        if (err) {
            console.log(err);
        } else {
            return res.status(200).json({ code: 200, message: 'Campground Added Successfully', data: doc });
        }
    });
    console.log('Added Camp =',campground);

});

// ======================
// Campground Find By ID
// ======================
router.get('/:id', verifyToken, async(req, res) => {
    const id = req.params.id;
    const camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path:'author'
        }
    }).populate('author');
    return res.json(camp);
});

// ========================
// Delete Campground By Id
// ========================
router.delete('/:id', async(req, res) => {
    const id = req.params.id;
    // Deleting Camp data
    const camp = await Campground.findByIdAndDelete(id);
    // Deleting Image from the cloudinary
    console.log('name of image',camp.images[0].filename);
    cloudinary.v2.uploader.destroy(camp.images[0].filename);
    
    return res.status(200).json({ code: 200, message: 'Campground Deleted Successfully.!' });
});

// ========================
// Update Campground By ID
// ========================
router.put('/:id', verifyToken, upload.array('images'), async(req, res) => {
    const id = req.params.id;
    const camp = (req.body);
    const imgs = req.body.images;
    console.log('Camp Image Body =', req.body)
    const campfinding = await Campground.findById(id);
    // ====================
    // Update Loacation
    // ==================
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    // ================
    // Findin Camp Log
    // ================
    console.log('Updated Camp ..!',camp);
  
    if(!campfinding.author.equals(req.userId)){
        return res.json({ message: 'Unauthorized User'})
    }
    camp.geometry = geoData.body.features[0].geometry;
    camp.images = req.files.map( f =>  ({url: f.path, filename: f.filename}));
    const campUpdate = await Campground.findByIdAndUpdate(id, { $set: camp }, { new: true });
    //Delete Previous Image when update Image ......
    cloudinary.v2.uploader.destroy(campfinding.images[0].filename);
    //campUpdate.images.push(...images);
    if(campUpdate){
        return res.status(200).json({ code: 200, message: 'Campground Updated Successfully' });
    }else{
        return res.status(400).json({ code: 200, message: 'Campground Not Updated ' });   
    }
});

// ==================
// Get All User 
// =================
// router.get('/allusers', async(req, res) => {
//     const allusers =  await User.find({});
//     return res.json({users: allusers});
// })

module.exports = router;