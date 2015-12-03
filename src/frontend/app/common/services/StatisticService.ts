module finalyze {
    'use strict';

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

    export class StatisticService {

        public static $inject = [
            '$http'
        ];

        constructor(private $http : ng.IHttpService) {

        }

        public getPath() : string {
            return '/statistics';
        }

        public getCombinedValues(starttime : number, endtime : number, resolution : string) : ng.IPromise<StatisticResponse> {
            return this.$http.get(this.getPath() + '/' + starttime + '/' + endtime + '/' + resolution).then((response) => {
                return response.data;
            });
        }
    }

    angular.module('Common').service('StatisticService', StatisticService);

}
