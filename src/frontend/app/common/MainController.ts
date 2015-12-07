module finalyze {
	'use strict';

	export class MainController {

		public static $inject : Array<string> = [
			'LanguageService'
		];

		constructor(private languageService : LanguageService) {

		}

		public getAvailableLanugages() : Array<Language> {
			return this.languageService.getAvailableLanguages();
		}

		public getCurrentLanguage() : Language {
			return this.languageService.getCurrentLanguage();
		}

		public changeLanguage(key : string) : void {
			this.languageService.setCurrentLanguage(key);
		}
	}

	angular.module('Common').controller('MainController', MainController);
}
