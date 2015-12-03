module finalyze {
    'use strict';

    /**
     * Wraps the ngTagsInput module https://github.com/mbenford/ngTagsInput
     *
     * `selectMode` is a boolean which, if true, will cause the component to behave like a <select> element - all
     * autosuggest suggestions are displayed by default, and only items from the autosuggest may be added
     */
    export function TagSelectorDirective(): ng.IDirective {
        var directive: ng.IDirective = {};
        directive.restrict = "E";
        directive.templateUrl = "app/common/directives/TagSelector.tpl.html";
        directive.controller = 'TagSelectorController';
        directive.controllerAs = 'vm';
        directive.bindToController = true;
        directive.scope = {
            ngModel: '=',
            availableTags: '=?',
            placeholder: '@?',
            selectMode: '='
        };
        directive.link = (scope: any, attrs:any) => {
            if (angular.isDefined(attrs.required)) {
                scope.required = true;
            }
        };

        return directive;
    }

    export class TagSelectorController {

        private availableTags: Array<string>;
        private ngModel: any;
        private placeholder: string;
        private selectMode: boolean;

        public static $inject = [
            '$q'
        ];
        constructor(private $q: ng.IQService) {}

        loadTags($query) {
            var filtered = [],
                query = $query.toLowerCase(),
                mapPredicate,
                filterFn = item => {
                    if (this.selectMode) {
                        return true;
                    } else {
                        return typeof item.name === 'string' ? item.name.toLowerCase().indexOf(query) > -1 : true;
                    }
                };

            if (typeof this.availableTags !== 'undefined' && 0 < this.availableTags.length) {
                // if it is an array of strings, wrap them in objects with a key 'name'
                if (typeof this.availableTags[0] === 'string') {
                    mapPredicate = name => ({name: name});
                } else {
                    mapPredicate = obj => obj;
                }

                filtered = this.availableTags.map(mapPredicate).filter(filterFn);
            }

            return this.$q.when(filtered);
        }
    }

    angular.module('Common')
        .directive('tagSelector', TagSelectorDirective)
        .controller('TagSelectorController', TagSelectorController);
}
