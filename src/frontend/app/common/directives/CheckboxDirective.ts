module am {
    'use strict';

    export function CheckboxDirective(): ng.IDirective {
        var directive: ng.IDirective = {};
        directive.priority = 0;
        directive.restrict = 'A';
        directive.templateUrl = 'app/common/directives/checkbox.tpl.html';
        directive.replace = true;
        directive.transclude = true;
        directive.scope = {
            name: '@',
            model: '=?',
            modelOptions: '=?',
            selected: '=?',
            onSelectToggle: '&?'
        };
        directive.link = (scope : any, element : any, attrs : any) => {
            scope.disabled = false;
            scope.toggle = () => {
                if (angular.isFunction(scope.onSelectToggle)) {
                    scope.onSelectToggle();
                }
            };

            scope.$watch(() => {
                return attrs.disabled;
            }, () => {
                scope.disabled = attrs.disabled;
            });

            scope.$watch('selected', () => {
                if (angular.isDefined(scope.selected)) {
                    if (angular.isFunction(scope.model)) {
                        scope.model(scope.selected);
                    } else {
                        scope.model = scope.selected;
                    }
                }
            });
        };

        return directive;
    }

    angular.module('Common').directive('uiCheckbox', CheckboxDirective);
}
