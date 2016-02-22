import mongoose = require('mongoose');
import crudable = require('../models/UserCRUDAble');
import Q = require('q');
var StatementSchema = new mongoose.Schema({
    hash: String,
    description : String,
    categories:[String],
    date : Number,
    amount : Number,
    account:  mongoose.Schema.Types.ObjectId,
    user:  mongoose.Schema.Types.ObjectId
});


export interface IStatement extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    hash: string;
    description : string;
    categories : Array<string>;
    date : number;
    amount : number;
    account : mongoose.Types.ObjectId;
    user : mongoose.Types.ObjectId;
}

export interface IStatementModel extends crudable.IUserCRUDAbleModel<IStatement> {
    findByAccount(account : mongoose.Types.ObjectId, user : mongoose.Types.ObjectId) : Q.Promise<Array<IStatement>>;
    deleteByAccount(account : mongoose.Types.ObjectId, user : mongoose.Types.ObjectId) : Q.Promise<boolean>;
    upsertAll(statements : Array<IStatement>, user : mongoose.Types.ObjectId) : Q.Promise<Array<IStatement>>;
}

StatementSchema.static('findByAccount', (account : mongoose.Types.ObjectId, user : mongoose.Types.ObjectId) : Q.Promise<Array<IStatement>> => {
    var deferred = Q.defer<Array<IStatement>>();
    var query = {
        account : account,
        user : user
    };
    StatementModel.find(query, (err, statements : Array<IStatement>) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(statements);
        }
    });
    return deferred.promise;
});

StatementSchema.static('deleteByAccount', (account : mongoose.Types.ObjectId, user : mongoose.Types.ObjectId) : Q.Promise<boolean> => {
    var deferred = Q.defer<boolean>();
    var query = {
        account : account,
        user : user
    };
    StatementModel.remove(query, (err) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(true);
        }
    });
    return deferred.promise;
});

StatementSchema.static('upsertAll', (statements : Array<IStatement>, user : mongoose.Types.ObjectId) : Q.Promise<Array<IStatement>> => {
    var promises : Array<Q.Promise<IStatement>> = [];

    statements.forEach((item : IStatement)=>{
        var query = {
            user : user,
            account : item.account
        },d = Q.defer<IStatement>();
        promises.push(d.promise);
        if (typeof item._id == 'undefined') {
            query['hash'] = item.hash;
        } else {
            query['_id'] = item._id;
            delete item._id;
        }
        StatementModel.findOneAndUpdate(query, item, {upsert:true}, (err, doc : IStatement) => {
            if (err) {
                d.reject(err);
            } else {
                d.resolve(doc);
            }
        });
    });
    return <Q.Promise<Array<IStatement>>>Q.all(promises);
});

export var StatementModel = <IStatementModel>crudable.initCrudable(StatementSchema, 'statements');


