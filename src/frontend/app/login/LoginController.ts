module finalyze {

	'use strict';

	export class LoginController {

		public static $inject = [
			'$state',
			'$modalStack'
		];

		public username : string;
		public password : string;

		constructor(private $state : ng.ui.IStateService,
					private $modalStack : ng.ui.bootstrap.IModalStackService) {
			this.$modalStack.dismissAll();
		}


	}

	angular.module('Login').controller('LoginController', LoginController);
}
