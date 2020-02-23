const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../modules/user');

exports.user_signup = (req, res, next) => {
    User.find({email: req.body.email}).exec()
        .then(user => {
            if(user.length >= 1) {
                return res.status(409).json({
                    message: 'Email already exists'
                });
            }
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                }
                const user = new User({
                    _id: mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: hash
                });
                user.save()
                    .then(user => {
                        console.log(user);
                        res.status(201).json({
                            message: 'User created successfully'
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(500).json({
                            error: error
                        })
                    })
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });
};

exports.user_login = (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length < 1){
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (error, response) => {
                if(error){
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if(response){
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            useIrd: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        });
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }
                return res.status(401).json({
                    message: 'Auth failed'
                });
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });
};

exports.user_delete = (req, res, next) => {
    User.deleteOne({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted successfully'
            })
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        })
};