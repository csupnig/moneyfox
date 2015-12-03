import mongoose = require('mongoose');
import Q = require('q');
import crudable = require('../models/UserCRUDAble');

var ClassifyerSettingsSchema = new mongoose.Schema({
    settings: String,
    user:  mongoose.Schema.Types.ObjectId
});

export interface IClassifyerSettings extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    settings : string;
    user : mongoose.Types.ObjectId;
}

export interface IClassifyerSettingsModel extends crudable.IUserCRUDAbleModel<IClassifyerSettings> {
    findOneByUser(user : mongoose.Types.ObjectId) : Q.Promise<IClassifyerSettings>;
}

ClassifyerSettingsSchema.static('findOneByUser', (user : mongoose.Types.ObjectId) : Q.Promise<IClassifyerSettings> => {
    var deferred = Q.defer<IClassifyerSettings>();
    var query = {
        user : user
    };
    ClassifyerSettingsModel.find(query, (err, settings : Array<IClassifyerSettings>) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(settings[0]);
        }
    });
    return deferred.promise;
});

export var ClassifyerSettingsModel = <IClassifyerSettingsModel>crudable.initCrudable(ClassifyerSettingsSchema,'classifyer');


