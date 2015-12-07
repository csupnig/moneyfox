module finalyze {

	'use strict';

	export class InputModalController {


		public static $inject : Array<string> = [
			'$scope',
			'StatementService',
			'AccountService',
			'CategoryService'
		];

		public selectedAccount : Account;

		public accounts : Array<Account>;

		public item : Statement;

		public statements : Array<Statement> = [];

		public categories : Array<Category>;

		constructor(public $scope : ng.ui.bootstrap.IModalScope,
					private statementService : StatementService,
					private accountService : AccountService,
					private categoryService : CategoryService) {
			this.accountService.getAll().then((accounts : Array<Account>)=> {
				this.accounts = accounts;
				if (this.accounts.length == 1) {
					this.selectedAccount = this.accounts[0];
				}
				return this.categoryService.getAll();
			}).then((categories : Array<Category>)=>{
				this.categories = categories;
				return true;
			}).then(() => {
				this.newStatement();
			});
		}

		public isValidItem() : boolean {
			return angular.isDefined(this.item) && angular.isDefined(this.item.account) && angular.isDefined(this.item.amount)
					&& angular.isDefined(this.item.date) && angular.isDefined(this.item.categories[0]);
		}

		public save() : void {
			this.statementService.save(this.item).then(()=>{
				this.statements.push(this.item);
				this.$scope.$close(this.statements);
			});
		}

		public next() : void {
			this.statementService.save(this.item).then(()=>{
				this.statements.push(this.item);
				this.newStatement();
			});
		}

		private newStatement() : void {
			this.item = new Statement();
			this.item.account = angular.isDefined(this.selectedAccount) ? this.selectedAccount._id : '';
			this.item.categories = [];
			this.item.date = new Date().getTime();
			if (angular.isDefined(this.categories) && this.categories.length > 0) {
				this.item.categories[0] = this.categories[0].title;
			}
		}

		public cancel(): void {
			this.$scope.$dismiss();
		}

	}

	angular.module('Settings').controller('InputModalController', InputModalController);
}
