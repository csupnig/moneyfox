
module finalyze {
    'use strict';


    /**
     * Service to display toast notifications to the user.
     * Each public method accepts a variable number of arguments. Each argument will be passed through the
     * translation filter and then displayed as a separate line in the notification.
     */
    export class NotificationService {

        public static $inject = [
            'ngToast', '$filter'
        ];

        constructor(private ngToast : ng.toast.IToastService, private $filter : ng.IFilterService) {
        }

        public info(...messages : string[]) : void {
            this.delegate('info', messages);
        }

        public warning(...messages : string[]) : void {
            this.delegate('warning', messages);
        }

        public danger(...messages : string[]) : void {
            this.delegate('danger', messages);
        }

        public success(...messages : string[]) : void {
            this.delegate('success', messages);
        }

        /**
         * Call the specified method on the ngToast service, and construct its content out of the array of
         * messages passed in.
         */
        private delegate(method: string, messages: string[]) {
            var content = messages
                .map(message => this.t(message))
                .reduce((prev, curr) =>  (curr) ? prev + '<br>' + curr : prev);

            this.ngToast[method]({
                content: content
            });
        }

        private t(message : string ) : string {
            return this.$filter('translate')(message);
        }


    }

    angular.module('Common').config(['ngToastProvider',
        (ngToastProvider : ng.toast.IToastService) => {
            ngToastProvider.configure({
                verticalPosition:'bottom'
            });
        }
    ]).service('NotificationService', NotificationService);

}
