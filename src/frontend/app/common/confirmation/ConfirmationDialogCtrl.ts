module finalyze {
    'use strict';

    export class ConfirmationDialogCtrl {
        public static $inject : Array<string> = [
            '$scope',
            'config',
            '$translate'
        ];

        text : string;

        selectedOption : any;

        constructor(private $scope : ng.ui.bootstrap.IModalScope,
                    public config : ConfirmationSelectConfig,
                    private $translate : any) {
            this.init();
        }

        private init() : void {
            var translateVars : Object = undefined;
            if (angular.isDefined(this.config.translateVars)) {
                translateVars = this.config.translateVars;
            }
            if (!angular.isDefined(this.config.buttons)) {
                this.config.buttons = ButtonTypes.SIMPLE_YES_NO;
            }
            this.text = this.$translate.instant(this.config.textKey, translateVars);
        }

        public showFinishButton() : boolean {
            return (!angular.isDefined(this.config.options) || this.config.options.length <= 0) || angular.isDefined(this.selectedOption);
        }

        public getPositiveTitle() : string {
            var title = this.config.buttons === ButtonTypes.WARNING_OK_SMALL_CANCEL || this.config.buttons === ButtonTypes.OK ? 'CONFIRMATION_OK' : 'CONFIRMATION_YES';
            return this.$translate.instant(angular.isDefined(this.config.buttontitles) && angular.isDefined(this.config.buttontitles.positiveTitle) ? this.config.buttontitles.positiveTitle : title, this.config.translateVars);
        }

        public getNegativeTitle() : string {
            var title = this.config.buttons == ButtonTypes.WARNING_OK_SMALL_CANCEL ? 'CONFIRMATION_CANCEL' : 'CONFIRMATION_NO';
            return this.$translate.instant(angular.isDefined(this.config.buttontitles) && angular.isDefined(this.config.buttontitles.negativeTitle) ? this.config.buttontitles.negativeTitle : title, this.config.translateVars);
        }

        public cancel() : void {
            this.$scope.$dismiss();
        }

        public close() : void {
            if (angular.isDefined(this.selectedOption)) {
                this.$scope.$close(this.selectedOption);
            } else {
                this.$scope.$close();
            }
        }
    }

    angular.module('Common').controller('ConfirmationDialogCtrl', ConfirmationDialogCtrl);
}
