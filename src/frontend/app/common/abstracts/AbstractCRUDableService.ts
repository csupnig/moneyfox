module finalyze {
    'use strict';

    export class REST {
        public static API_BASE_PATH : string = '';
    }

    export class CRUDAble {
        _id : string;
    }

    export interface IQuery<T> {
        query : any;
    }

    export class AbstractCRUDableService<T extends CRUDAble> {

        public static $inject = [
            '$http'
        ];

        constructor(public $http : ng.IHttpService) {
        }

        public getPath() : string {
            throw "YOU SHOULD NOT USE THE ABSTRACT SERVICE";
            return 'NOT IMPLEMENTED';
        }

        public get(_id : string) : ng.IPromise<T> {
            return this.$http.get(REST.API_BASE_PATH + this.getPath() + '/' + _id);
        }

        public search(query : IQuery<T>) : ng.IPromise<Array<T>> {
            return this.$http.post(REST.API_BASE_PATH + this.getPath() + '/search', query).then((response : ng.IHttpPromiseCallbackArg<Array<T>>) => {
                return response.data;
            });
        }

        public getAll() : ng.IPromise<Array<T>> {
            return this.$http.get(REST.API_BASE_PATH + this.getPath()).then((response : ng.IHttpPromiseCallbackArg<Array<T>>) => {
                return response.data;
            });
        }

        public create(item : T) : ng.IPromise<T> {
            return this.$http.post(REST.API_BASE_PATH + this.getPath(), item);
        }

        public save(item : T) : ng.IPromise<T> {
            return this.$http.put(REST.API_BASE_PATH + this.getPath(), item);
        }

        public delete(item : T) : ng.IPromise<string> {
            return this.$http.delete(REST.API_BASE_PATH + this.getPath() + '/' + item._id, item)
                .then((response : any)=>{
                    return response.message ? response.message : item._id;
                });
        }
    }

}
