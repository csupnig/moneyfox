import mongoose = require('mongoose');
import FacebookStrategy = require('passport-facebook');
import usermodel = require('../models/User');


export function init(passport, config) {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        usermodel.UserModel.findOne({ _id: id }, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy.Strategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL,
            profileFields:['id', 'displayName', 'email']
        },
        (accessToken, refreshToken, profile : FacebookStrategy.Profile, done : (err:any, user:any) => void) => {
            usermodel.UserModel.findOrCreateFacebookUser(profile).then((user : usermodel.IUser)=>{
                done(null, user);
            }).catch((err)=>{
                done(err, null);
            })
        }));
}
