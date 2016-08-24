module finalyze {
    'use strict';

    export interface ConfirmationConfigBase {
        textKey : string;
        buttons? : ButtonTypes;
        translateVars? : Object;
        buttontitles? : ButtonTitles;
        // maybe extended in future
    }

    export class ConfirmationSelectOption {
        constructor(public title : string, public value : any) {
        }
    }

    export interface ConfirmationSelectConfig extends ConfirmationConfigBase {
        options : Array<ConfirmationSelectOption>;
    }

    export class ButtonTitles {
        constructor(public positiveTitle : string, public negativeTitle : string) {
        }
    }

    export enum ButtonTypes {
        SIMPLE_YES_NO,
        WARNING_YES_SMALL_NO,
        WARNING_OK_SMALL_CANCEL,
        OK
    }

    export class ConfirmationService {

        public static $inject : Array<string> = [
            '$uibModal'
        ];

        constructor(private $modal : ng.ui.bootstrap.IModalService) {

        }

        showConfirmationDialog(config : ConfirmationConfigBase) : ng.IPromise<void> {
            var modalInstance = this.$modal.open({
                templateUrl: 'app/common/confirmation/confirmationdialog.tpl.html',
                controller: 'ConfirmationDialogCtrl',
                controllerAs: 'vm',
                resolve: {
                    'config': function() {
                        return config;
                    }
                }
            });
            return modalInstance.result;
        }

        showConfirmationSelectDialog(config : ConfirmationSelectConfig) : ng.IPromise<void> {
            var modalInstance = this.$modal.open({
                templateUrl: 'app/common/confirmation/confirmationdialog.tpl.html',
                controller: 'ConfirmationDialogCtrl',
                controllerAs: 'vm',
                resolve: {
                    'config': function() {
                        return config;
                    }
                }
            });
            return modalInstance.result;
        }
    }

    angular.module('Common').service('ConfirmationService', ConfirmationService);
}
