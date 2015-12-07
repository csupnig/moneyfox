
module finalyze {
	'use strict';

	export class Language {
		constructor(public title : string, public key : string) {}
	}

	export class LanguageService {

		public static $inject = [
			'$translate'
		];

		private availableLanguages : Array<Language> = [];

		constructor(private $translate : ng.translate.ITranslateService) {
			this.availableLanguages.push(new Language('GERMAN', 'de_DE'));
			this.availableLanguages.push(new Language('ENGLISH', 'en_US'));
		}

		public getAvailableLanguages() : Array<Language> {
			return this.availableLanguages;
		}

		public getCurrentLanguage() : Language {
			var key = this.$translate.use(),
					lang : Language;
			angular.forEach(this.availableLanguages, (l : Language) => {
				if (l.key === key) {
					lang = l;
				}
			});
			return lang;
		}

		public setCurrentLanguage(key : string) : void {
			this.$translate.use(key);
		}
	}

	angular.module('Common').service('LanguageService', LanguageService);

}
