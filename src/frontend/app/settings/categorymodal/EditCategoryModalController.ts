module finalyze {

	'use strict';

	export class EditCategoryModalController {

		public static $inject : Array<string> = [
			'$scope',
			'CategoryService',
			'item',
			'nextColor'
		];

		constructor(private $scope : ng.ui.bootstrap.IModalScope,
					private CategoryService : CategoryService,
					public item : Category,
					private nextColor : string) {

			if (!angular.isDefined(this.item) || this.item === null) {
				this.item = new Category();
			}
			if (!angular.isDefined(this.item.color)) {
				this.item.color = nextColor;
			}
		}

		public save(): void {
			this.CategoryService.save(this.item)
				.then((item : Category) => {
					this.$scope.$close(item);
				});
		}

		public cancel(): void {
			this.$scope.$dismiss();
		}

	}

	angular.module('Settings').controller('EditCategoryModalController', EditCategoryModalController);
}
