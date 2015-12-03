
import Q = require('q');
import csv = require('fast-csv');
import fs = require('fs');
import mongoose = require('mongoose');
import statement = require('../models/Statement');
import u = require('../models/User');
import crypto = require('crypto');
import moment = require('moment');

export interface ICSVDescription {
    amount : number;
    date : number;
    description : number;
    dateformat? : string;
}

export class CSVDataProcessor {

    constructor(){}

    public handle(path : string, description : ICSVDescription, account : mongoose.Types.ObjectId, user : u.IUser) : Q.Promise<Array<statement.IStatement>> {

        var deferred = Q.defer<Array<statement.IStatement>>(),
            stream = fs.createReadStream(path),
            statements : Array<statement.IStatement> = [];


        var csvStream : any = csv({
                delimiter:';',
                trim:true
            })
            .on("data", (data) => {
                var statement : statement.IStatement,
                    md5sum = crypto.createHash('md5');
                if (typeof description == 'undefined') {
                    description = this.findCSVDescription(data);
                }
                md5sum.update(data[description.description]);
                md5sum.update(data[description.date]);
                md5sum.update(data[description.amount]);
                statement = <statement.IStatement>{
                    hash: md5sum.digest('hex'),
                    description: data[description.description],
                    categories: [],
                    date: this.parseDate(data,description),
                    amount: this.parseAmount(data, description),
                    user: user._id,
                    account: account
                };
                statements.push(statement);
            })
            .on("end", () => {
                fs.unlink(path, (err) => {
                    if (err) {
                        deferred.reject(statements);
                    } else {
                        deferred.resolve(statements);
                    }
                });
            });

        stream.pipe(csvStream);

        return deferred.promise;
    }

    private parseAmount(data, description : ICSVDescription) : number {
        var amount = data[description.amount];
        if (typeof amount === 'Number') {
            return amount;
        }
        amount = amount.replace(/\./g, '');
        amount = amount.replace(/,/g, '.');
        return Number(amount);
    }

    private parseDate(data, description) : number {
        var d = data[description.date],
            format = description.dateformat ? description.dateformat : 'DD.MM.YYYY';

        return moment(d,format).toDate().getTime();
    }

    private findCSVDescription(data : Array<string>) : ICSVDescription {
        return {
            amount :4,
            date : 2,
            description : 1,
            dateformat : 'DD.MM.YYYY'
        };
    }
}
