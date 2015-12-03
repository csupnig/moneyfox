module finalyze {

	'use strict';

	export class InputController {

		public static $inject = [
			'$state', '$modal', 'StatementService', 'NotificationService','CategoryService'
		];

		public statements : Array<Statement>;
		public categories : Array<string> = [];
		
		constructor(private $state : ng.ui.IStateService,
					private $modal : ng.ui.bootstrap.IModalService,
					private StatementService : StatementService,
					private NotificationService : NotificationService,
					private CategoryService : CategoryService) {
			this.CategoryService.getAll().then((cats)=>{
				angular.forEach(cats, (item : Category)=>{
					this.categories.push(item.title);
				});
			});
		}

		public openUploadModal() : void {
			this.$modal.open({
				templateUrl: 'app/input/uploadmodal/uploadmodal.tpl.html',
				controller: 'UploadModalController',
				controllerAs: 'vm'
			}).result
					.then((stmts : Array<Statement>) => {
						this.statements = stmts;
					});
		}

		public openSelectModal() : void {
			this.$modal.open({
				templateUrl: 'app/input/selectmodal/selectmodal.tpl.html',
				controller: 'SelectModalController',
				controllerAs: 'vm'
			}).result
					.then((stmts : Array<Statement>) => {
						this.statements = stmts;
					});
		}

		public save() : void {
			this.StatementService.saveAll(this.statements).then(()=>{
				this.NotificationService.success('INPUT_SAVE_SUCCESSFUL');
				this.$state.go('app.statistics');
			}).catch(()=>{
				this.NotificationService.danger('INPUT_SAVE_ERROR');
			});
		}

	}

	angular.module('Input').controller('InputController', InputController);
}
