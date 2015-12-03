module finalyze {
    'use strict';
    export class UserAuthHttpInterceptor {
        static CODE_RESPONSE_UNAUTHORIZED = 401;
        static AUTH_HEADER_NAME = 'Authorization';

        public static $inject = [
            "$q",
            '$injector'
        ];

        constructor(public $q : ng.IQService,  private $injector:ng.auto.IInjectorService) {
            // this corresponds in res
        }

        public responseError = (response) => {
            // check for CONFLICT response
            // NOTE: this code is the result of an expired auth token
            if (response.status === UserAuthHttpInterceptor.CODE_RESPONSE_UNAUTHORIZED) {
                var $state : ng.ui.IStateService = this.$injector.get("$state");
                $state.go("login");

            }
            return this.$q.reject(response);
        };

        public request = (config) => {

            return config;
        };

    }
    angular.module("Login").service("UserAuthHttpInterceptor", UserAuthHttpInterceptor);
}
