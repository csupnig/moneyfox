import Q = require('q');
import mongoose = require('mongoose');
import statement = require('../models/Statement');
import category = require('../models/Category');
import moment = require('moment');

export class StatisticResponse {
    start : number;
    end : number;
    resolution : string;
    labels : Array<string>;
    categories : Array<StatisticCategoryResult>;
}

export class StatisticCategoryResult {
    category : string;
    color : string;
    values : Array<number>;
}

export class StatisticCombiner {

    constructor(){}

    public combine(statements : Array<statement.IStatement>, resolution : string, categories : Array<category.ICategory>) : StatisticResponse {
        var ret = new StatisticResponse(),
            map = {},
            cats = [],
            allowedCategories = [];

        ret.labels = [];
        categories.forEach((cat : category.ICategory) => {
            allowedCategories.push(cat.title);
        });
        statements.forEach((item : statement.IStatement) => {
            var cat = item.categories ? item.categories[0] : 'NO_CATEGORY',
                res = moment(item.date).format(resolution);
            if (allowedCategories.indexOf(cat) >= 0) {
                if (ret.labels.indexOf(res) < 0) {
                    ret.labels.push(res);
                }
                if (cats.indexOf(cat) < 0) {
                    cats.push(cat);
                }
                if (typeof map[cat] === 'undefined') {
                    map[cat] = {};
                }
                if (typeof map[cat][res] === 'undefined') {
                    map[cat][res] = 0;
                }
                map[cat][res] += item.amount;
            }
        });

        ret.labels.sort(function(a, b){
            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });

        ret.categories = [];
        cats.forEach((cat : string)=>{
            var result = new StatisticCategoryResult();
            result.category = cat;
            result.values = [];
            categories.forEach((c : category.ICategory) => {
                if (c.title === cat) {
                    result.color = c.color;
                }
            });
            if (!result.color) {
                result.color = '';
            }
            ret.labels.forEach((label : string) => {
                result.values.push(this.getValue(map[cat][label]));
            });
            ret.categories.push(result);
        });

        return ret;
    }

    private getValue(num : any) : number {
        return typeof num != 'undefined' && num != null ? Math.abs(num) : 0;
    }
}
