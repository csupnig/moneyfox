module finalyze {
	'use strict';

	export function TimestampDirective(): ng.IDirective {
		var directive: ng.IDirective = {};
		directive.restrict = "A";
        directive.priority = 500;
        directive.require = 'ngModel';
        directive.link = ($scope : ng.IScope, $element:any, attrs:any, ngModel : ng.INgModelController) => {
            ngModel.$parsers.push((value) => {
                if (angular.isNumber(value)) {
                    return value;
                } else if (angular.isDate(value)) {
                    return value.getTime();
                }
                return value;
            });

            ngModel.$formatters.push((value) => {
                if (angular.isNumber(value)) {
                    return new Date(value);
                }
                return value;
            });
        };

		return directive;
	}

	angular.module('Common').directive('timestamp', TimestampDirective);
}
