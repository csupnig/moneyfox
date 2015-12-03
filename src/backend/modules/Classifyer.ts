import Q = require('q');
import mongoose = require('mongoose');
import statement = require('../models/Statement');
import u = require('../models/User');
import csettings = require('../models/Classifyer');
import bayes = require('bayes');

export class Classifyer {

    constructor(){}

    public classify(statements : Array<statement.IStatement>, user : u.IUser) : Q.Promise<Array<statement.IStatement>> {

        var deferred = Q.defer<Array<statement.IStatement>>();

        csettings.ClassifyerSettingsModel.findOneByUser(user._id).then((settings : csettings.IClassifyerSettings)=>{
            if (typeof settings != 'undefined') {
                var classifier = bayes.fromJson(settings.settings);
                if (typeof classifier != 'undefined') {
                    statements.forEach((item : statement.IStatement)=>{
                        var category = classifier.categorize(item.description);
                        if (typeof category != 'undefined' && category != 'undefined') {
                            item.categories = [category];
                        } else {
                            item.categories = [];
                        }
                    });
                    deferred.resolve(statements);
                } else {
                    deferred.resolve(statements);
                }
            } else {
                deferred.resolve(statements);
            }
        }).catch((err)=>{
            console.error(err);
            deferred.resolve(statements);
        });

        return deferred.promise;
    }

    public getSettings(user : u.IUser) : Q.Promise<csettings.IClassifyerSettings> {
        return csettings.ClassifyerSettingsModel.findOneByUser(user._id);
    }

    public resetSettings(user : u.IUser) : Q.Promise<csettings.IClassifyerSettings> {
        var settings = <csettings.IClassifyerSettings>{
            settings :'',
            user : user._id
        };
        return csettings.ClassifyerSettingsModel.createOrSaveForUser(settings,user._id);
    }


    public learn(statements : Array<statement.IStatement>, user : u.IUser) : Q.Promise<Array<statement.IStatement>> {

        var deferred = Q.defer<Array<statement.IStatement>>();

        csettings.ClassifyerSettingsModel.findOneByUser(user._id).then((settings : csettings.IClassifyerSettings)=>{
            var classifier;
            if (typeof settings != 'undefined') {
                bayes.fromJson(settings.settings);
            } else {
                settings = <csettings.IClassifyerSettings>{
                    settings :'',
                    user : user._id
                };
                classifier = bayes();
            }

            if (typeof classifier == 'undefined') {
                classifier = bayes();
            }
            statements.forEach((item : statement.IStatement)=>{
                classifier.learn(item.description, item.categories[0]);
            });
            settings.settings = classifier.toJson();
            csettings.ClassifyerSettingsModel.createOrSaveForUser(settings,user._id).then(()=>{
                deferred.resolve(statements);
            }).catch((err)=>{
                console.error(err);
                deferred.reject(statements);
            });

        }).catch((err)=>{
            console.error(err);
            deferred.reject(statements);
        });

        return deferred.promise;
    }
}
