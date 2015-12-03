module finalyze {

	'use strict';

	export class EditAccountModalController {

		public static $inject : Array<string> = [
			'$scope', 'AccountService', 'item'
		];

		constructor(private $scope : ng.ui.bootstrap.IModalScope,
					private AccountService : AccountService,
					public item : Account) {

			if (!angular.isDefined(item) || item === null) {
				this.item = new Account();
			}
		}

		public save(): void {
			this.AccountService.save(this.item)
				.then((account : Account) => {
					this.$scope.$close(account);
				});
		}

		public cancel(): void {
			this.$scope.$dismiss();
		}

	}

	angular.module('Settings').controller('EditAccountModalController', EditAccountModalController);
}
