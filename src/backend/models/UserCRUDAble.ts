import mongoose = require('mongoose');
import Q = require('q');
import FacebookStrategy = require('passport-facebook');

export interface IUserCrudable extends mongoose.Document {
    user : mongoose.Types.ObjectId;
}

export interface IUserCRUDAbleModel<T extends IUserCrudable> extends mongoose.Model<T> {
    findByUserID(user : mongoose.Types.ObjectId) : Q.Promise<Array<T>>;
    search(query: any, user : mongoose.Types.ObjectId) : Q.Promise<Array<T>>;
    findOneForUser(id : mongoose.Types.ObjectId, user : mongoose.Types.ObjectId) : Q.Promise<T>;
    createOrSaveForUser(item : T, user : mongoose.Types.ObjectId) : Q.Promise<T>;
    deleteOneForUser(id : mongoose.Types.ObjectId, user : mongoose.Types.ObjectId) : Q.Promise<void>;
}


export function initCrudable<T extends IUserCrudable>(Schema : mongoose.Schema, db : string) : IUserCRUDAbleModel<T>{
    var Model : IUserCRUDAbleModel<T>;

    console.log('SETTING UP CRUDABLE', db);

    Schema.static('search', (query : any, user : mongoose.Types.ObjectId) : Q.Promise<Array<T>> => {
        var deferred = Q.defer<Array<T>>();
        var q = query ? query : {};
        q['user']=user;
        Model.find(query, (err, items : any) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(items);
            }
        });
        return deferred.promise;
    });

    Schema.static('findByUserID', (user : mongoose.Types.ObjectId) : Q.Promise<Array<T>> => {
        var deferred = Q.defer<Array<T>>();
        var query = {
            user : user
        };
        Model.find(query, (err, items : any) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(items);
            }
        });
        return deferred.promise;
    });

    Schema.static('findOneForUser', (id : mongoose.Types.ObjectId, user : mongoose.Types.ObjectId) : Q.Promise<T> => {
        var deferred = Q.defer<T>();
        var query = {
            _id : id,
            user : user
        };
        Model.findOne(query, (err, account : T) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(account);
            }
        });
        return deferred.promise;
    });

    Schema.static('createOrSaveForUser', (item : T, user : mongoose.Types.ObjectId) : Q.Promise<T> => {
        var deferred = Q.defer<T>();
        if (typeof item._id != 'undefined') {
            var query = {
                _id : item._id,
                user : user
            };
            Model.update(query,item,(err, rows, raw)=>{
                if (err){
                    deferred.reject(err);
                } else {
                    deferred.resolve(raw);
                }
            });
        } else {
            item.user = user;
            Model.create(
                item,
                (err, created) => {
                    if (err) {
                        deferred.reject(err);
                    }
                    deferred.resolve(created);
                }
            );
        }

        return deferred.promise;
    });

    Schema.static('deleteOneForUser', (id : mongoose.Types.ObjectId, user : mongoose.Types.ObjectId) : Q.Promise<T> => {
        var deferred = Q.defer<T>();
        var query = {
            _id : id,
            user : user
        };
        Model.findOne(query, (err, account : T) => {
            if (err) {
                deferred.reject(err);
            } else if (account){
                account.remove((err)=>{
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(account);
                    }
                });
            } else {
                deferred.reject("not found");
            }
        });
        return deferred.promise;
    });

    Model = <IUserCRUDAbleModel<T>>mongoose.model(db, Schema);
    return Model;
}
