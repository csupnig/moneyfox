import mongoose = require('mongoose');

import crudable = require('../models/UserCRUDAble');

var AccountSchema = new mongoose.Schema({
    IBAN:  String,
    title: String,
    user:  mongoose.Schema.Types.ObjectId
});

export interface IAccount extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    IBAN : string;
    title : string;
    user : mongoose.Types.ObjectId;
}

export interface IAccountModel extends crudable.IUserCRUDAbleModel<IAccount> {
}

export var AccountModel = crudable.initCrudable(AccountSchema,'accounts');


