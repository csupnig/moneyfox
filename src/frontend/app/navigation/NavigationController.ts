module finalyze {

	'use strict';

	export class NavigationController {

		public static $inject = [
			'$state'
		];

		constructor(private $state : ng.ui.IStateService) {
			this.init();
		}

		init() {
		}

	}

	angular.module('Navigation').controller('NavigationController', NavigationController);
}
