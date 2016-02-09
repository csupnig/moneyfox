module am {
    'use strict';

    export class MultiSelectModelLoader {
        constructor(public loaderfunction : (filter : string) => ng.IPromise<boolean>) {
        }
    }

    export class KeyCode {
        public static ENTER: number = 13;
        public static TAB: number = 9;
        public static SPACE: number = 32;
        public static ESCAPE: number = 27;
        public static ARROW_UP: number = 38;
        public static ARROW_DOWN: number = 40;
        public static SHIFT: number = 16;
        public static CTRL: number = 17;
        public static WIN_LEFT: number = 91;
    }

    angular.module('Common')

        // from bootstrap-ui typeahead parser
        .factory('optionParser', ['$parse', function($parse) {

            //                      00000111000000000000022200000000000000003333333333333330000000000044000
            var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

            return {
                parse: function(input) {

                    var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
                    if (!match) {
                        throw new Error(
                            'Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
                            ' but got "' + input + '".');
                    }

                    return {
                        itemName: match[3],
                        source: $parse(match[4]),
                        viewMapper: $parse(match[2] || match[1]),
                        modelMapper: $parse(match[1])
                    };
                }
            };
        }])

        .directive('multiselect', ['$parse', '$document', '$compile', 'optionParser', '$templateCache',

            function($parse, $document, $compile, optionParser, $templateCache) {
                return {
                    restrict: 'EA',
                    require: 'ngModel',
                    link: function(originalScope, element, attrs, modelCtrl) {

                        var exp = attrs.options,
                            parsedResult = optionParser.parse(exp),
                            isMultiple = attrs.multiple ? true : false,
                            isReturnArray = attrs.returnarray ? true : false,
                            isValueOnly = attrs.valueonly ? true : false,
                            idquals = attrs.idequals ? true : false,
                            required = false,
                            scope = originalScope.$new(),
                            changeHandler = attrs.change || angular.noop,
                            checkForFilter = true;

                        scope.modelloader = $parse(attrs.modelload)(originalScope);
                        $templateCache.put('amui.multiselect.defaultitemtemplate', '{{i.model}}');
                        $templateCache.put('amui.multiselect.defaultheadertemplate', '{{header|translate}}');
                        $templateCache.put('amui.multiselect.defaultfootertemplate', '');
                        $templateCache.put('amui.multiselect.defaulttopitemtemplate', '');

                        scope.itemtemplate = attrs.itemtemplate ? attrs.itemtemplate : 'amui.multiselect.defaultitemtemplate';
                        scope.topitemtemplate = attrs.topitemtemplate ? attrs.topitemtemplate : 'amui.multiselect.defaulttopitemtemplate';
                        scope.headertemplate = attrs.headertemplate ? attrs.headertemplate : 'amui.multiselect.defaultheadertemplate';
                        scope.footertemplate = attrs.footertemplate ? attrs.footertemplate : 'amui.multiselect.defaultfootertemplate';

                        if (angular.isDefined(attrs.filter)) {
                            scope.filterenabled = $parse(attrs.filter)(originalScope);
                            checkForFilter = false;
                        } else {
                            scope.filterenabled = true;
                        }

                        scope.filterfor = angular.isDefined(attrs.filterfor) ? $parse(attrs.filterfor)(originalScope) : undefined;

                        scope.items = [];
                        scope.header = 'Select';
                        scope.multiple = isMultiple;
                        scope.disabled = false;
                        scope.modelCtrl = modelCtrl;
                        scope.isValueOnly = isValueOnly;
                        scope.ideuqals = idquals;
                        originalScope.$on('$destroy', function() {
                            scope.$destroy();
                        });

                        var popUpEl = angular.element('<multiselect-popup></multiselect-popup>');

                        // required validator
                        if (attrs.required || attrs.ngRequired) {
                            required = true;
                        }
                        attrs.$observe('required', function(newVal) {
                            required = newVal;
                        });

                        // watch disabled state
                        scope.$watch(() : any => {
                            return $parse(attrs.disabled)(originalScope);
                        }, (newVal) : void => {
                            scope.disabled = newVal;
                        });

                        // watch single/multiple state for dynamically change single to multiple
                        scope.$watch(() : any => {
                            return $parse(attrs.multiple)(originalScope);
                        }, (newVal) => {
                            isMultiple = newVal || false;
                        });

                        // watch option changes for options that are populated dynamically
                        scope.$watch(() : any => {
                            return parsedResult.source(originalScope);
                        }, (newVal) : void => {
                            if (angular.isDefined(newVal)) {
                                parseModel();
                            }
                        }, true);

                        // watch model change
                        scope.$watch(() : any => {
                            return modelCtrl.$modelValue;
                        }, (newVal, oldVal) : void => {
                            // when directive initialize, newVal usually undefined. Also, if model value already set in the controller
                            // for preselected list then we need to mark checked in our scope item. But we don't want to do this every time
                            // model changes. We need to do this only if it is done outside directive scope, from controller, for example.
                            if ((angular.isDefined(newVal) || angular.isDefined(oldVal))) {
                                markChecked(newVal);
                            }
                            getHeaderText();
                            modelCtrl.$setValidity('required', scope.valid());
                            scope.selected = newVal;
                        }, true);

                        function parseModel() {
                            scope.items.length = 0;
                            var model = parsedResult.source(originalScope);
                            if (!angular.isDefined(model)) {
                                return;
                            }
                            for (var i = 0; i < model.length; i++) {
                                var local = {};
                                local[parsedResult.itemName] = model[i];
                                scope.items.push({
                                    label: parsedResult.viewMapper(local),
                                    model: model[i],
                                    checked: false
                                });
                            }
                            // check if the value was already set and we have to mark the selected ones
                            if (angular.isDefined(modelCtrl.$modelValue)) {
                                markChecked(modelCtrl.$modelValue);
                            }
                            if (checkForFilter === true && !angular.isDefined(scope.modelloader)) {
                                scope.filterenabled = scope.items.length >= 5;
                            }
                        }

                        parseModel();

                        element.append($compile(popUpEl)(scope));

                        function getHeaderText() {
                            if (!is_empty(attrs.label)) {
                                scope.header = attrs.label;
                                return;
                            }
                            if (is_empty(modelCtrl.$modelValue)) {
                                scope.header = 'SELECT';
                                return;
                            }
                            if (isMultiple) {
                                scope.header = modelCtrl.$modelValue.length;
                            } else {
                                var local = {};
                                local[parsedResult.itemName] = modelCtrl.$modelValue;

                                scope.header = parsedResult.viewMapper(local);
                            }
                        }

                        function is_empty(obj) {
                            if (!obj) {
                                return true;
                            }
                            if (obj.length && obj.length > 0) {
                                return false;
                            }

                            for (var prop in obj) {
                                if (obj[prop]) {
                                    return false;
                                }
                            }
                            return true;
                        }

                        scope.valid = function validModel() {
                            if (!required) {
                                return true;
                            }
                            var value = modelCtrl.$modelValue;
                            return (angular.isArray(value) && value.length > 0) || (!angular.isArray(value) && value !== null);
                        };

                        function selectSingle(item) {
                            if (item.checked) {
                                scope.uncheckAll();
                            } else {
                                scope.uncheckAll();
                                item.checked = !item.checked;
                            }
                            setModelValue(false);
                        }

                        function selectMultiple(item) {
                            item.checked = !item.checked;
                            setModelValue(true);
                        }

                        function setModelValue(isMultiple) {
                            var value;
                            if (isMultiple || isReturnArray) {
                                value = [];
                                angular.forEach(scope.items, function(item) {
                                    if (item.checked) {
                                        value.push(getItemValue(item));
                                    }
                                });
                            } else {
                                angular.forEach(scope.items, function(item) {
                                    if (item.checked) {
                                        value = getItemValue(item);
                                        return false;
                                    }
                                });
                            }
                            scope.model = value;
                            modelCtrl.$setViewValue(value);
                            scope.$eval(changeHandler);
                        }

                        function getItemValue(item) {
                            return isValueOnly ? item.model.value : item.model;
                        }

                        function itemEquals(valueone, valuetwo) {
                            return angular.equals(valueone, valuetwo)
                                || (scope.ideuqals === true
                                    && angular.isDefined(valueone) && angular.isDefined(valuetwo)
                                    && ((angular.isDefined(valueone.id) && valueone.id === valuetwo.id)
                                        || (angular.isDefined(valueone.ordinal) && valueone.ordinal === valuetwo.ordinal)));
                        }

                        function markChecked(newVal) {
                            // BEFORE WE START WITH MARKING ITEMS, WE WANT ALL TO BE UNCHECKED
                            angular.forEach(scope.items, (item) => {
                                item.checked = false;
                            });
                            if (!angular.isArray(newVal)) {
                                angular.forEach(scope.items, function(item) {
                                    if (itemEquals(getItemValue(item), newVal)) {
                                        item.checked = true;
                                        return false;
                                    }
                                });
                            } else {
                                angular.forEach(newVal, (i) : void => {
                                    angular.forEach(scope.items, function(item) {
                                        if (itemEquals(getItemValue(item), i)) {
                                            item.checked = true;
                                        }
                                    });
                                });
                            }
                        }

                        scope.checkAll = () : void => {
                            if (!isMultiple) {
                                return;
                            }
                            angular.forEach(scope.items, (item) => {
                                item.checked = true;
                            });
                            setModelValue(true);
                        };

                        scope.uncheckAll = () : void => {
                            angular.forEach(scope.items, function(item) {
                                item.checked = false;
                            });
                            setModelValue(true);
                        };

                        scope.select = (item) : void => {
                            if (isMultiple === false) {
                                selectSingle(item);
                                scope.toggleSelect();
                            } else {
                                selectMultiple(item);
                            }
                        };
                    }
                };
            }])

        .directive('multiselectPopup', ['$document', '$q', function($document : ng.IDocumentService, $q : ng.IQService) {
            return {
                restrict: 'E',
                scope: false,
                replace: true,
                templateUrl: 'app/common/directives/multiselect.tpl.html',
                link: function(scope, element, attrs) {
                    var ddMenu = element.find('.dropdown-menu'),
                        searchRequests : number = 0;
                    scope.isVisible = false;
                    scope.modelloading = false;

                    // watch search changes to trigger search
                    scope.$watch('searchText', () => {
                        if (angular.isDefined(scope.modelloader) && angular.isFunction(scope.modelloader.loaderfunction)) {
                            var modelLoader : MultiSelectModelLoader = scope.modelloader;
                            if (angular.isDefined(modelLoader)) {
                                searchRequests++;
                                scope.modelloading = true;
                                modelLoader.loaderfunction(scope.searchText).finally(() => {
                                    if (--searchRequests <= 0) {
                                        scope.modelloading = false;
                                    }
                                });
                            }
                        }
                    }, true);

                    scope.toggleSelect = function() {
                        if (element.hasClass('open')) {
                            element.removeClass('open');
                            $document.unbind('click', clickHandler);
                            $(element).parents('multiselect').find('button.togglebutton').focus();
                        } else {
                            element.addClass('open');
                            $document.bind('click', clickHandler);
                            scope.focus();
                        }
                    };

                    scope.focusItem = function(item) {
                        var topOffset = item.offset().top;
                        var height = ddMenu.height();
                        var scrollTop = Math.max(topOffset - height, 0);
                        item.focus();
                        // ddMenu.scrollTop(scrollTop);
                        // console.log(topOffset, height, scrollTop, ddMenu.scrollTop());
                    };

                    scope.toggleSelectKey = ($event) : void => {
                        if (element.hasClass('open')) {
                            if ($event.which === KeyCode.ARROW_DOWN) {
                                scope.focusItem(element.find('.selectable').first());
                            } else if ($event.which === KeyCode.ARROW_UP) {
                                scope.focusItem(element.find('.selectable').last());
                            }
                        } else if ($event.which === KeyCode.ARROW_DOWN || $event.which === KeyCode.ARROW_UP) {
                            scope.toggleSelect();
                        }
                    };

                    scope.inputKey = ($event) : void => {
                        if ($event.which === KeyCode.ARROW_DOWN) {
                            scope.focusItem(element.find('.selectable').first());
                            $event.preventDefault();
                        } else if ($event.which === KeyCode.ARROW_UP) {
                            scope.focusItem(element.find('.selectable').last());
                            $event.preventDefault();
                        } else if ($event.which === KeyCode.ESCAPE) {
                            scope.toggleSelect();
                            $event.stopPropagation();
                        } else if ($event.which === KeyCode.TAB) {
                            scope.toggleSelect();
                        }
                    };

                    scope.keyNav = ($event, item) : void => {
                        var currentIndex = 0;
                        if ($event.which === KeyCode.ENTER || $event.which === KeyCode.SPACE) {
                            scope.select(item);
                            $event.preventDefault();
                        } else if ($event.which === KeyCode.ARROW_DOWN) {
                            currentIndex = element.find('.selectable').index($event.currentTarget);
                            if (++currentIndex > (element.find('.selectable').length - 1)) {
                                currentIndex = 0;
                            }
                            scope.focusItem(element.find('.selectable').eq(currentIndex));
                            $event.preventDefault();
                        } else if ($event.which === KeyCode.ARROW_UP) {
                            currentIndex = element.find('.selectable').index($event.currentTarget);
                            if (--currentIndex < 0) {
                                currentIndex = element.find('.selectable').length - 1;
                            }
                            scope.focusItem(element.find('.selectable').eq(currentIndex));
                            $event.preventDefault();
                        } else if ($event.which === KeyCode.ESCAPE) {
                            scope.toggleSelect();
                            $event.stopPropagation();
                        } else if ($event.which === KeyCode.TAB) {
                            scope.toggleSelect();
                        }
                    };

                    var elementMatchesAnyInArray = function(element, elementArray) {
                        for (var i = 0; i < elementArray.length; i++) {
                            if (element === elementArray[i]) {
                                return true;
                            }
                        }
                        return false;
                    };

                    function clickHandler(event) {
                        if (elementMatchesAnyInArray(event.target, element.find(event.target.tagName))) {
                            return;
                        }
                        element.removeClass('open');
                        $document.unbind('click', clickHandler);
                        scope.$apply();
                    }

                    scope.focus = () : void => {
                        // element.find('.selectable').first().focus();
                        var searchBox = element.find('input')[0];
                        searchBox.focus();
                    };
                }
            };
        }]).filter('objectPropertiesFilter', function() {
            return function(input : Array<any>, searchString : string, filterfor : Array<string>) {
                if (angular.isDefined(searchString) && searchString.trim()) {
                    var returnValues : Array<string> = [];
                    var searchProperties : Array<string> = searchString.split(' ');
                    var matchCount : number = 0;

                    for (var i = 0; i < input.length; i++) {
                        var model = input[i].model;
                        var keys = angular.isDefined(filterfor) ? filterfor : Object.keys(model);
                        for (var keyCounter = 0; keyCounter < keys.length; keyCounter++) {
                            var value = model[keys[keyCounter]];
                            for (var j = 0; j < searchProperties.length; j++) {
                                if (angular.isString(value)) {
                                    if (value.toLowerCase().indexOf(searchProperties[j].toLowerCase()) !== -1) {
                                        matchCount++;
                                    }
                                }
                            }
                        }
                        if (model.toLowerCase().indexOf(searchString.toLowerCase()) !== -1 || matchCount >= searchProperties.length) {
                            returnValues.push(input[i]);
                        }
                        matchCount = 0;

                    }
                    return returnValues;
                }

                return input;

            };
        });
}
