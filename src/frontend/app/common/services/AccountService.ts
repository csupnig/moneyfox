module finalyze {
    'use strict';

    export class Account extends CRUDAble {
        title : string;
        IBAN : string;
    }

    export class AccountService extends AbstractCRUDableService<Account> {

        public static $inject = [
            '$http'
        ];

        constructor($http : ng.IHttpService) {
            super($http)
        }

        public getPath() : string {
            return '/settings/account';
        }
    }

    angular.module('Common').service('AccountService', AccountService);

}
