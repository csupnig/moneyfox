module finalyze {
    'use strict';

    export class Category extends CRUDAble {
        title : string;
        color : string;
    }

    export class CategoryService extends AbstractCRUDableService<Category> {

        public static $inject = [
            '$http'
        ];

        constructor($http : ng.IHttpService) {
            super($http)
        }

        public getPath() : string {
            return '/settings/category';
        }
    }

    angular.module('Common').service('CategoryService', CategoryService);

}
