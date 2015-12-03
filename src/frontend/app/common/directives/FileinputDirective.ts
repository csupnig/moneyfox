
module finalyze {
	'use strict';

	export interface IFileinputDirectiveScope extends ng.IScope {
		onselect : (FileList)=>void;
	}

	export class FileinputDirective {
		public static $inject: Array<string> = [];
		constructor() {
			var directive: ng.IDirective = {};
			directive.priority = 0;
			directive.restrict = "A";
			directive.transclude = true;
			directive.templateUrl = "app/common/directives/fileinput.tpl.html";
			directive.replace = true;
			directive.scope = {
				onselect : "&"
			};
			directive.link = function ($scope : IFileinputDirectiveScope, $element:any, attrs:any) {
				var $fileinput = jQuery($element).find('.fileinput'),
					$fileuploadcontainer = jQuery($element).find('.uploadpanel');
				$fileuploadcontainer.click((e) => {
					e.preventDefault();
					$fileinput.trigger('click');
					return false;
				});
				$fileuploadcontainer.on('dragenter', (e) => {
					$fileuploadcontainer.addClass('dragover');
				}).on('dragover', (e : any) => {
					e.stopPropagation();
					e.preventDefault();
					$fileuploadcontainer.addClass('dragover');
					e.originalEvent.dataTransfer.dropEffect = 'copy';
				}).on('dragleave',(e : any)=>{
					$fileuploadcontainer.removeClass('dragover');
				}).on('drop', (e : any) => {
					e.preventDefault();
					$fileuploadcontainer.removeClass('dragover');
					$scope.onselect({'files':e.originalEvent.dataTransfer.files});
				});
				$fileinput.on('change', (e : any) => {
					$scope.onselect({'files':e.target.files});
				})

			};

			return directive;
		}
	}

	angular.module('Common').directive('fileinput', FileinputDirective);
}
