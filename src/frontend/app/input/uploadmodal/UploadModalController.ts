module finalyze {

	'use strict';

	export class UploadModalController {


		public static $inject = [
			'$scope',
			'CSVUploadService',
			'AccountService'
		];

		public selectedAccount : Account;

		public accounts : Array<Account>;

		constructor(public $scope : ng.ui.bootstrap.IModalScope,
					private CVSUploadService : CSVUploadService,
					private AccountService : AccountService) {
			this.AccountService.getAll().then((accounts : Array<Account>)=>{
				this.accounts = accounts;
				if (this.accounts.length == 1) {
					this.selectedAccount = this.accounts[0];
				}
			})
		}

		public onselectfiles(files : Array<File>) : void {
			this.CVSUploadService.uploadCSVs(files, {
				amount :4,
				date : 2,
				description : 1,
				dateformat : 'DD.MM.YYYY'
			}, this.selectedAccount).then((data : Array<Array<Statement>>) => {
				var statements : Array<Statement> = [];
				angular.forEach(data, (stmts : Array<Statement>)=>{
					angular.forEach(stmts,(item:Statement)=>{
						statements.push(item);
					});
				});
				this.$scope.$close(statements);
			});
		}

		public cancel(): void {
			this.$scope.$dismiss();
		}

	}

	angular.module('Settings').controller('UploadModalController', UploadModalController);
}
