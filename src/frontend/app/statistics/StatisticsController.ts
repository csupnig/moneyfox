module finalyze {
	'use strict';

	export class StatisticsController {

		public static $inject = [
			'$state',
			'StatisticService',
			'NotificationService'
		];

		public starttime : Date;
		public endtime : Date;

		public data : Array<Array<number>>;
		public series : Array<string>;
		public labels : Array<string>;
		public colors : Array<string>;
		
		constructor(private $state : ng.ui.IStateService,
					private StatisticService : StatisticService,
					private NotificationService : NotificationService) {
			this.endtime = moment().toDate();
			this.starttime = moment().subtract(12, 'months').toDate();
			this.select();
		}

		public select() : void {
			this.StatisticService.getCombinedValues(this.starttime.getTime(), this.endtime.getTime(), 'YYYY-MM').then((result : StatisticResponse) => {
				this.data = [];
				this.series = [];
				this.colors = [];
				this.labels = result.labels;
				angular.forEach(result.categories, (cat : StatisticCategoryResult) => {
					this.data.push(cat.values);
					this.series.push(cat.category);
					this.colors.push(cat.color);
				});
			});
		}
	}

	angular.module('Statistics').controller('StatisticsController', StatisticsController);
}
