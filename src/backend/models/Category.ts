import mongoose = require('mongoose');
import crudable = require('../models/UserCRUDAble');

var CategorySchema = new mongoose.Schema({
    title: String,
    color : String,
    user:  mongoose.Schema.Types.ObjectId
});


export interface ICategory extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    title : string;
    color : string;
    user : mongoose.Types.ObjectId;
}

export interface ICategoryModel extends crudable.IUserCRUDAbleModel<ICategory> {
}

export var CategoryModel = crudable.initCrudable(CategorySchema, 'categories');


