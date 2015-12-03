module finalyze {
    'use strict';

    export class Statement extends CRUDAble {
        hash: string;
        description : string;
        categories : Array<string>;
        date : number;
        amount : number;
    }

    export class StatementService extends AbstractCRUDableService<Statement> {

        public static $inject = [
            '$http'
        ];

        constructor($http : ng.IHttpService) {
            super($http)
        }

        public getPath() : string {
            return '/statement';
        }

        public saveAll(statements : Array<Statement>) : ng.IPromise<Array<Statement>> {
            return this.$http.post('/statements', statements).then((data)=>{
                return data.data;
            });
        };

        public deleteByAccount(account : Account) : ng.IPromise<boolean> {
            return this.$http.delete('/statements/' + account._id).then(()=>{
                return true;
            });
        }
    }

    angular.module('Common').service('StatementService', StatementService);

}
