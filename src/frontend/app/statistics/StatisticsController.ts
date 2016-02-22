module finalyze {
	'use strict';

	export class StatisticsController {

		public static $inject : Array<string> = [
			'$state',
			'StatisticService',
			'CategoryService',
			'NotificationService',
			'$filter',
			'$timeout'
		];

		public starttime : Date;
		public endtime : Date;

		public data : Array<Array<number>>;
		public series : Array<string>;
		public labels : Array<string>;
		public colors : Array<string>;

		public statisticResponse : StatisticResponse;

		public availableCategories : Array<Category>;
		public selectedCategories : Array<Category>;

		public calculateSum : boolean = true;
		
		constructor(private $state : ng.ui.IStateService,
					private StatisticService : StatisticService,
					private categoryService : CategoryService,
					private NotificationService : NotificationService,
					private $filter : ng.IFilterService,
					private $timeout : ng.ITimeoutService) {
			this.endtime = moment().toDate();
			this.starttime = moment().subtract(12, 'months').toDate();
			this.categoryService.getAll().then((categories) => {
				this.availableCategories = [];
				this.selectedCategories = [];
				angular.forEach(categories, (cat : Category) => {
					this.availableCategories.push(cat);
					this.selectedCategories.push(cat);
				});
			});
			this.select();
		}

		public filter() : void {
			var cats = this.selectedCategories.map((cat : Category)=>{
				return cat.title;
			}), sums : Array<number> = [];
			if (!angular.isDefined(this.selectedCategories) || this.selectedCategories.length <=0) {
				return;
			}
			this.$timeout(()=>{
				this.data = [];
				this.series = [];
				this.colors = [];
				if (angular.isDefined(this.statisticResponse)) {
				this.labels = this.statisticResponse.labels;
					angular.forEach(this.statisticResponse.categories, (cat : StatisticCategoryResult) => {
						if (cats.indexOf(cat.category) > -1) {
							this.data.push(cat.values);
							this.series.push(cat.category);
							this.colors.push(cat.color);
							if (this.calculateSum) {
								this.addToSums(sums,cat.values);
							}
						}
					});
					if (this.calculateSum) {
						this.data.push(sums);
						this.series.push(this.$filter('translate')('SUM'));
						this.colors.push('#f0ad4e');
					}
				}
			});
		}

		private addToSums(sums : Array<number>, values : Array<number>) : void {
			angular.forEach(values, (value, index) => {
				if (!angular.isDefined(sums[index])) {
					sums[index] = 0;
				}
				sums[index]+=value;
			});
		}

		public select() : void {
			this.StatisticService.getCombinedValues(this.starttime.getTime(), this.endtime.getTime(), 'YYYY-MM').then((result : StatisticResponse) => {
				this.statisticResponse = result;
				this.filter();
			});
		}
	}

	angular.module('Statistics').controller('StatisticsController', StatisticsController);
}
