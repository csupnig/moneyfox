import mongoose = require('mongoose');
import Q = require('q');
import FacebookStrategy = require('passport-facebook');

var UserSchema = new mongoose.Schema({
    firstName:  String,
    lastName:   String,
    email:      String,
    salt:       String,
    hash:       String,
    facebook:{
        id:       String,
        email:    String,
        name:     String
    },
    google:{
        id:       String,
        email:    String,
        name:     String
    }
});

export interface IOAuthInfo {
    id : string;
    email : string;
    name : string;
}


export interface IOAuthEmailObject {
    value : string;
}
export interface IOAauthProfile {
    id : string;
    emails : Array<IOAuthEmailObject>;
    displayName : string;
    authOrigin : string;
}

export interface IUser extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    firstName : string;
    lastName : string;
    email : string;
    salt? : string;
    hash? : string;
    facebook? : IOAuthInfo;
    google? : IOAuthInfo;
}

export interface IUnsavedUser {
    firstName : string;
    lastName : string;
    email : string;
    salt? : string;
    hash? : string;
    facebook? : IOAuthInfo;
    google? : IOAuthInfo;
}


export interface IUserModel extends mongoose.Model<IUser> {
    findOrCreateFacebookUser(profile : FacebookStrategy.Profile) : Q.Promise<IUser>;
}


UserSchema.static('findOrCreateFacebookUser', (profile : FacebookStrategy.Profile) : Q.Promise<IUser> => {
    var deferred = Q.defer<IUser>();
    // Build dynamic key query
    var query = {
        facebook : {
            id : profile.id
        }
    };
    // Search for a profile from the given auth origin
    UserModel.findOne(query, (err, user : IUser) => {
        if (err) {
            deferred.reject(err);
        }

        // If a user is returned, load the given user
        if (user) {
            deferred.resolve(user);
        } else {

            // Otherwise, store user, or update information for same e-mail
            UserModel.findOne({ 'email' : typeof profile.emails != 'undefined' ? profile.emails[0].value : undefined, }, (err, user : IUser) => {
                if (err) {
                    deferred.reject(err);
                }
                if(user){
                    // Preexistent e-mail, update
                    user.facebook = {
                        id : profile.id,
                        email : typeof profile.emails != 'undefined' ? profile.emails[0].value : undefined,
                        name : profile.displayName
                    };

                    user.save((err, user : IUser) => {
                        if (err) {
                            deferred.reject(err);
                        }
                        deferred.resolve(user);
                    });
                } else {
                    var newuser : IUnsavedUser = {
                        email : typeof profile.emails != 'undefined' ? profile.emails[0].value : undefined,
                        firstName : profile.displayName.split(" ")[0],
                        lastName : profile.displayName.replace(profile.displayName.split(" ")[0] + " ", ""),
                        facebook : {
                            id : profile.id,
                            email : typeof profile.emails != 'undefined' ? profile.emails[0].value : undefined,
                            name : profile.displayName
                        }
                    };

                    UserModel.create(
                        newuser,
                        (err, user) => {
                            if (err) {
                                deferred.reject(err);
                            }
                            deferred.resolve(user);
                        }
                    );
                }
            });
        }
    });
    return deferred.promise;
});

export var UserModel = <IUserModel>mongoose.model('users', UserSchema);

