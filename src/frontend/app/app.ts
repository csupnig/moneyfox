
module finalyze{
    'use strict';

    angular.module('finalyze', [
		'FinalyzeTplCache',
		'Navigation',
		'Common',
		'Input',
		'Settings',
		'Statistics',
		'Directives',
    	'Login',
		'pickadate',
		'ngResource',
		'ngMessages',
		'ngSanitize',
		'ngTagsInput',
		'ui.router',
		'ngToast',
		'ui.bootstrap',
		'chart.js',
		'colorpicker.module',
		'pascalprecht.translate'
	]).config(['$translateProvider', '$stateProvider', '$httpProvider', '$urlRouterProvider', ($translateProvider, $stateProvider : ng.ui.IStateProvider, $httpProvider : ng.IHttpProvider, $urlRouterProvider : ng.ui.IUrlRouterProvider) => {

    $httpProvider.interceptors.push('UserAuthHttpInterceptor');
		$translateProvider.useStaticFilesLoader({
			prefix: 'languages/lang-',
			suffix: '.json'
		});
		$translateProvider.useMessageFormatInterpolation();
		$translateProvider.preferredLanguage('de_DE');
		$translateProvider.useSanitizeValueStrategy('sanitize');
		MessageFormat.locale.de_DE=function(n){return n===1?"one":"other"};

		$stateProvider
			.state('app', {
				abstract: true,
				url: '/',
				views: {
					'':{
						controller: 'MainController',
						controllerAs: 'vm',
						templateUrl: 'app/common/main.tpl.html'
					},
					'navigation@app': {
						controller: 'NavigationController',
						controllerAs: 'vm',
						templateUrl: 'app/navigation/navigation.tpl.html'
					},
				}
			}).state('app.input', {
				url: 'input',
				views: {
					'content': {
						controller:'InputController',
						controllerAs: 'vm',
						templateUrl:'app/input/input.tpl.html'
					}
				}
			}).state('app.statistics', {
				url: '',
				views: {
					'content': {
						controller:'StatisticsController',
						controllerAs: 'vm',
						templateUrl:'app/statistics/statistics.tpl.html'
					}
				}
			})
			.state('app.settings', {
				url: 'settings',
				views: {
					'content': {
						controller:'SettingsController',
						controllerAs: 'vm',
						templateUrl:'app/settings/settings.tpl.html'
					}
				}
			}).state('login', {
				url: '/login',
				views: {
					'':{
						controller: 'LoginController',
						controllerAs: 'vm',
						templateUrl: 'app/login/login.tpl.html'
					}
				}
			});
		$urlRouterProvider.otherwise('/');
	}]);

}
