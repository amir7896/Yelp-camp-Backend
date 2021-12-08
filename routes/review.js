const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/reviews');
const jwt  = require('jsonwebtoken');



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

// ===========================
// DELETE A Review By Its ID
// ==========================
router.delete('/:reviewId', async(req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    return res.status(200).json({ code: 200, message: 'Review Deleted Successfully.!' });
});

// ============================
// Review Route to Post Review
// ============================
router.post('/', verifyToken, async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review({
        comment: req.body.comment,
        rating: req.body.rating
    });
    review.author = req.userId;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    console.log('Review Creator ', review.author);
    return res.status(200).json({ code: 200, message: 'Review Added Successfully.!' });
});



module.exports = router;