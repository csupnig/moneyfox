module finalyze {
    'use strict';


    export class MomentFilter {
        public static $inject : Array<string> = ['$filter'];

        constructor(public $filter : ng.IFilterService) {
        }

        filter(input : Date, formatstring : string) : string {
            var that = this,date;
            if (typeof input != 'undefined' && typeof formatstring != 'undefined') {
                formatstring = formatstring.replace(/\[(.*?)\]/g, function(match, $1) {
                    return '[' + that.$filter('translate')($1) + ']';
                });
                date = moment(input);
                if (date.isValid()) {
                    return date.format(formatstring);
                } else {
                    return '';
                }
            } else {
                return null;
            }
        }
    }

    angular.module('Common').filter('moment', ['$filter', function($filter : ng.IFilterService) {
        var inst = new MomentFilter($filter);
        return function(input : Date, formatstring : string) {
            return inst.filter(input, formatstring);
        };
    }]);
}
