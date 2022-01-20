const express = require('express');
const router  = express.Router();
const User  = require('../models/user');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

//================================
// Handling Forget Password Route
//================================

router.post("/forget", function(req, res,next){
	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err, buf){
				var token = buf.toString('hex');
				done(err,token);
				
			});
		},
		function(token, done){
			User.findOne({email:req.body.email}, function(err,user){
				if(!user){
					res.json({success: false, code : 500, message : 'Email Not Exists.!'});
					//return res.redirect("/forget");
				}else{
					user.resetPasswordToken = token;
					user.resetPasswordExpires= Date.now() +3600000;// 1 hour
	
					user.save(function(err){
						done(err,token,user);
					});
				}
			});
		},
		function(token, user,done){
			var smtpTransport  = nodemailer.createTransport({
				service : 'Gmail',
				secure: false,
				auth :{
					user:"Your email",
					pass:"Your Password",
				}
			});
			const mailOptions ={
				to: user.email,
				from:"amirshahzad07896@gmail.com",
				subject: 'Node.js Password Reset', // + req.headers.host
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				'https://'
                + req.headers.host +'/reset/' +token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
			smtpTransport.sendMail(mailOptions , function(err){
				console.log("Mail Sent");
				res.json({success: true, code: 300, message: 'Reset Link Has been Sent to Your Email.!'});
				done(err, 'done');
			});
		}
		], function(err){
			if(err) return next(err);
            console.log(err);
			//res.redirect("/forget");
		});
});

//============
//Reset Route
//============

router.get('/reset/:token',function(req,res){
	User.findOne({resetPasswordToken:req.params.token , resetPasswordToken:{$gt :Date.now()}}, function(err,user){
		if(!user){
            res.json({success: 500, message: 'Password Reset Token Has Been Expired.!'})
			//req.flash("error", "Password Reseet Token Has Expired");
			//return res.redirect("/forget");
		}
		//res.render('reset', {token:req.params.token});
	});
});

//==============
//Handling Reset
//==============
router.post('/reset/:token',function(req,res){
	async.waterfall([
		function(done){
			User.findOne({resetPasswordToken :req.params.token ,  resetPasswordToken:{$gt :Date.now()}}, function(err,user){
				if(!user){
                    res.json({success: false, code: 500, message: 'Password Reset Token Has Been Expired.!'})
					//return res.redi('back');
				}
				if(req.body.password === req.body.confirm){
					user.setPassword(req.body.password , function(err){
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires=undefined;
						user.save(function(err){
							req.logIn(user,function(err){
								done(err, user)
							});
						});
						console.log(req.body.password);
					})
				}else{
					// req.flash("error" , "Password Not Match");
					//return res.redirect('back');
					res.json({success: false ,code: 400, message: 'Password Not Match.!'})
                    console.log('Eroorrrrrr**');
				}
			
			});
		},
		function(user, done){
			var smtpTransport = nodemailer.createTransport({
				service:"Gmail",
				auth:{
					user:"Your Email",
					pass:"Your Password",
				}
			});
			const mailOptions ={
				to:user.email,
				from:"amirshahzad07896@gmail.com",
				subject:"Your Password Has Been Changed",
				text:"Hello ,\n\n"+
				"This Is Conformation Password for Your Account"+user.email + " has just Update "
			};
			smtpTransport.sendMail(mailOptions, function(err){
				//req.flash("success", "Your Pass word has Been Changed");
                res.json({success: true ,code : 300, message: 'Your Password Has Been Changed.!'})
				done(err);
			});
		}

		], function(err){
			//res.redirect("/campgrounds");
            console.log(err);
		});
});

module.exports = router;
