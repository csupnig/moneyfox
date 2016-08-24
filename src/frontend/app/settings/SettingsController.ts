module finalyze {

	'use strict';

	export class SettingsController {

		public static DEFAULT_COLORS : Array<string> = ["#97BBCD", "#DCDCDC", "#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"];

		public static $inject : Array<string> = [
			'$state',
			'AccountService',
			'CategoryService',
			'StatementService',
			'$uibModal',
			'NotificationService',
			'ConfirmationService'
		];

		public accounts : Array<Account>;
		public categories : Array<Category>;

		private nextColors : Array<string>;
		
		constructor(private $state : ng.ui.IStateService,
					private AccountService : AccountService,
					private CategoryService : CategoryService,
					private StatementService : StatementService,
					private $modal : ng.ui.bootstrap.IModalService,
					private NotificationService : NotificationService,
					private ConfirmationService : ConfirmationService) {
			this.loadAccounts();
			this.loadCategories();
		}

		public loadAccounts() : void {
			this.AccountService.getAll().then((items : Array<Account>) => {
				this.accounts = items;
			});
		}

		public loadCategories() : void {
			this.CategoryService.getAll().then((items : Array<Category>) => {
				this.categories = items;
				this.nextColors = angular.copy(SettingsController.DEFAULT_COLORS);
				angular.forEach(items, (item : Category) => {
					var index = this.nextColors.indexOf(item.color);
					if (index >= 0) {
						this.nextColors.splice(index, 1);
					}
				});
			});
		}

		public openAccountModal(item? : Account) : void {
			this.$modal.open({
				templateUrl: 'app/settings/accountmodal/editaccountmodal.tpl.html',
				controller: 'EditAccountModalController',
				controllerAs: 'vm',
				resolve: {
					item: ()=>item
				}
			}).result
				.then(() => {
					this.loadAccounts();
				});
		}

		public openCategoryModal(item? : Category) : void {
			this.$modal.open({
				templateUrl: 'app/settings/categorymodal/editcategorymodal.tpl.html',
				controller: 'EditCategoryModalController',
				controllerAs: 'vm',
				resolve: {
					item: ()=>item,
					nextColor : () => {
						return angular.isDefined(this.nextColors[0]) ? this.nextColors[0] : '';
					}
				}
			}).result
					.then(() => {
						this.loadCategories();
					});
		}

		public deleteAccount(item : Account) : void {
			this.ConfirmationService.showConfirmationDialog({
				textKey: 'CONFIRMATION_DELETE_ACCOUNT',
				buttontitles: new ButtonTitles('CONFIRMATION_DELETE_ACCOUNT_YES', 'CONFIRMATION_DELETE_ACCOUNT_NO')
			}).then(() => {
				return this.StatementService.deleteByAccount(item);
			}).then(()=>{
				return this.AccountService.delete(item);
			}).then(()=>{
				this.NotificationService.success('SETTINGS_ACCOUNT_DELETED');
				this.loadAccounts();
			});
		}

		public deleteCategory(item : Category) : void {
			this.CategoryService.delete(item).then(()=>{
				this.NotificationService.success('SETTINGS_CATEGORY_DELETED');
				this.loadCategories();
			});
		}
	}

	angular.module('Settings').controller('SettingsController', SettingsController);
}
