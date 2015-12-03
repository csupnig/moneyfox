
module finalyze {
	'use strict';

	export class LanguageService {

		public static $inject = [
			'$http', '$q'
		];


		constructor(private $http : ng.IHttpService, private $q : ng.IQService) {
		}

		public getDefaultLanguage() : string {
			return "de";
		}

	}

	angular.module('Common').service('LanguageService', LanguageService);

}
