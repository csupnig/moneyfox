module finalyze {

	'use strict';

	export class MainController {

		public static $inject = [
			'$state'
		];

		constructor(private $state : ng.ui.IStateService) {
			this.init();
		}

		init() {
		}

		public logout() : void {

		}
	}

	angular.module('Common').controller('MainController', MainController);
}
