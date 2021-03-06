const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('../models/reviews');
const User = require('../models/user');

const campgroundSchema = new Schema({
    title: { type: String, required: true },
    images : [
        {
            url: String,
            filename: String
        }
    ],
    geometry: {
        type:{
            type: String,
            enum:['Point'],
            required: true
        },
        coordinates:{
            type: [Number],
            required: true
        }
    },
    price: { type: Number },
    description: { type: String, required: true },
    location: { type: String, required: true },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
        type: Schema.Types.ObjectId,
        ref: "Review",
    
       }, 
    ],

})
campgroundSchema.post("findOneAndDelete", async function(doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews,
            },
        });
    }
});

module.exports = mongoose.model('Campground', campgroundSchema);