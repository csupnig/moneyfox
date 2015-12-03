module finalyze {

	'use strict';

	export class SelectModalController {


		public static $inject = [
			'$scope',
			'StatementService',
			'AccountService'
		];

		public selectedAccount : Account;

		public accounts : Array<Account>;
		public starttime : Date;
		public endtime : Date;

		constructor(public $scope : ng.ui.bootstrap.IModalScope,
					private StatementService : StatementService,
					private AccountService : AccountService) {
			this.endtime = moment().toDate();
			this.starttime = moment().subtract(1, 'months').toDate();
			this.AccountService.getAll().then((accounts : Array<Account>)=>{
				this.accounts = accounts;
				if (this.accounts.length == 1) {
					this.selectedAccount = this.accounts[0];
				}
			})
		}

		public select() : void {
			this.StatementService.search({query:{"date":{$gt : this.starttime.getTime(), $lt : this.endtime.getTime()}}}).then((statements : Array<Statement>) => {
			//this.StatementService.search({query:{}}).then((statements : Array<Statement>) => {
				this.$scope.$close(statements);
			})
		}

		public cancel(): void {
			this.$scope.$dismiss();
		}

	}

	angular.module('Settings').controller('SelectModalController', SelectModalController);
}
