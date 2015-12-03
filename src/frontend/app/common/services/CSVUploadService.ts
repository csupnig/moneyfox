
module finalyze {
    'use strict'

    export interface ICSVDescription {
        amount : number;
        date : number;
        description : number;
        dateformat? : string;
    }

    export class CSVUploadService {

        public static $inject = [
            '$http', '$q'
        ];

        constructor(private $http : ng.IHttpService, private $q : ng.IQService) {
        }

        uploadCSVs(files : Array<File>, description : ICSVDescription, account : Account) : ng.IPromise<Array<Array<Statement>>> {
            var filePromises = [];

            angular.forEach(files, (file : File)=>{
                filePromises.push(this.uploadCSV(file, description, account));
            });

            return this.$q.all(filePromises);
        }

        uploadCSV(file : File, description : ICSVDescription, account : Account) : ng.IPromise<Array<Statement>> {
            var formData = new FormData();
            formData.append('file', file);
            formData.append('csvdescription', description);
            formData.append('account', account._id);
            return this.$http.post('/upload/csv',formData,{
                transformRequest: angular.identity,
                    "headers": {'Content-Type': undefined}
            }).then((data)=>{
                return data.data.data;
            });
        }
    }

    angular.module('Common').service('CSVUploadService', CSVUploadService);

}
