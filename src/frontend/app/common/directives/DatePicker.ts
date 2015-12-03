module finalyze {
	'use strict';

    /**
     * Wrapper for the ngPickadate directive that performs conversion from a unix timestamp (which is how the
     * dates are stored in the Mesh model.
     *
     * @returns {ng.IDirective}
     * @constructor
     */
	export function DatePickerDirective(): ng.IDirective {
		var directive: ng.IDirective = {};
		directive.restrict = "E";
        directive.priority = 500;
		directive.templateUrl = "app/common/directives/datePicker.tpl.html";
        directive.require = 'ngModel';
        directive.scope = {
            name: '@',
            ngModel: '=',
            onSet: '&'
        };
        directive.compile = () => {
            return {
                /**
                 * Pre-link function is used because we need to set up the scope vars *before* the inner ngPickADate
                 * directive is linked. When using the usual post-link function, the setEventHandler() method was
                 * not yet defined when ngPickADate was being linked.
                 *
                 * I think it is something to do with the order of execution when Angular performs it's DOM traversal
                 * during compilation.
                 */
                pre: (scope: any, element, attrs, ngModelController) => {
                    function isset(val) {
                        const emptyVals = ['', ' ', null, 0, '0'];
                        return emptyVals.filter(empty => val === empty).length === 0;
                    }

                    if (isset(scope.ngModel)) {
                        scope.dateModel = new Date(scope.ngModel * 1000);
                    } else {
                        scope.dateModel = null;
                    }

                    scope.setEventHandler = (date) => {
                        var newdate;
                        if (date.select) {
                            newdate = Math.round(date.select / 1000);
                            // dont check for type quality here
                            if (scope.ngModel != newdate) {
                                scope.ngModel = newdate;
                                ngModelController.$setDirty();
                            }
                        } else if (date.hasOwnProperty('clear')) {
                            // if ngModel is already null, then we should not set the form to be dirty as
                            // nothing has changed.
                            if (scope.ngModel !== null) {
                                scope.ngModel = null;
                                ngModelController.$setDirty();
                            }
                        }
                        scope.onSet({"date" : date});
                        if (angular.isString(scope.ngModel)) {
                            scope.ngModel = Number(scope.ngModel);
                        }
                    };

                    scope.$watch('ngModel', transformModel);

                    function transformModel(ngModel) {
                        if (isset(ngModel)) {
                            scope.dateModel = new Date(ngModel * 1000);
                        } else {
                            scope.dateModel = null;
                            scope.ngModel = null;
                        }
                    }

                }
            }
        };

		return directive;
	}

	angular.module('Common').directive('datePicker', DatePickerDirective);
}
