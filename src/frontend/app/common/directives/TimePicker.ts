module tvc {
    'use strict';

    /**
     * Directive for selecting HH:mm:ss
     */
    export function TimePickerDirective(): ng.IDirective {
        var directive: ng.IDirective = {};
        directive.restrict = "E";
        directive.priority = 500;
        directive.templateUrl = "app/common/directives/timePicker.tpl.html";
        directive.require = '^ngModel';
        directive.scope = {
            ngModel: '='
        };
        directive.link = (scope: any, element) => {

            scope.focussed = '';

            scope.$watch('ngModel', val => {

                if (val !== null) {
                    var date = moment.unix(val);
                    scope.time = {
                        h: date.format('HH'),
                        m: date.format('mm'),
                        s: date.format('ss')
                    };
                } else {
                    scope.time = { h: null, m: null, s: null};
                }
            });

            scope.$watchCollection('time', (time, oldVal) => {
                if (time.h < 0 || 23 < time.h) {
                    time.h = oldVal.h;
                }
                if (time.m < 0 || 59 < time.m) {
                    time.m = oldVal.m;
                }
                if (time.s < 0 || 59 < time.s) {
                    time.s = oldVal.s;
                }

                if (time.h !== null || time.m !== null || time.s !== null) {
                    var date = moment.unix(scope.ngModel),
                        dateDay = date.startOf('day'),
                        timestamp = (parseInt(time.h || 0) * 3600) + (parseInt(time.m || 0) * 60) + parseInt(time.s || 0);

                    scope.ngModel = (dateDay.unix() + timestamp).toFixed(0);
                }
            });

            scope.keydown = (event: JQueryEventObject) => {
                var input = <HTMLInputElement>event.target,
                    key = {
                        leftArrow: 37,
                        rightArrow: 39,
                        upArrow: 38,
                        downArrow: 40
                    },
                    char = String.fromCharCode(event.which),
                    isNumeric = /[0-9]/.test(char),
                    isAlpha = /[a-zA-Z]/.test(char);

                if (isAlpha) {
                    event.preventDefault();
                    return;
                }

                if (event.which === key.upArrow) {
                    increment(input);
                    event.preventDefault();
                }
                if (event.which === key.downArrow) {
                    decrement(input);
                    event.preventDefault();
                }

                if (input.selectionStart === input.value.length && event.which === key.rightArrow) {
                    focusNext(input);
                }

                if (input.selectionEnd === 0 && event.which === key.leftArrow) {
                    focusPrev(input);
                }

                if (input.selectionStart === 1) {
                    if (input.value.length === 1 && isNumeric) {
                        focusNext(input);
                    }
                }
            };

            function increment(input: HTMLInputElement) {
                scope.ngModel = parseInt(scope.ngModel || 0) + getIncrementAmount(input);
            }

            function decrement(input: HTMLInputElement) {
                scope.ngModel = parseInt(scope.ngModel || 0) - getIncrementAmount(input);
            }

            function getIncrementAmount(input: HTMLInputElement) {
                var factors = {
                        hour: 3600,
                        minute: 60,
                        second: 1
                    };
                return factors[input.classList[0]];
            }

            scope.focusFirst = (event) => {
                if ($(event.target).hasClass('tvc-time-input')) {
                    element.find('input').first().focus().select();
                }
            };
            scope.focus = (event, focusTarget) => {
                element.find('.tvc-time-input').addClass('focus');
                scope.focussed = focusTarget;
                event.preventDefault();
            };
            scope.blur = () => {
                element.find('.tvc-time-input').removeClass('focus');
            };

            function focusNext(input) {
                setTimeout(() =>  $(input).next().focus().select(), 0);
            }
            function focusPrev(input) {
                setTimeout(() =>  $(input).prev().focus().select(), 0);
            }
        };

        return directive;
    }

    angular.module('Common').directive('timePicker', TimePickerDirective);
}
