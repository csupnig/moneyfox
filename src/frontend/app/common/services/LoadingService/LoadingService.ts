
module finalyze {
    'use strict';

    export class LoadingIndicator {

        private $element: JQuery;
        private $overlay;
        private $spinner;
        private resizeInterval;
        private margin = 2;

        constructor(element: HTMLElement | Element | JQuery, private registry: LoadingIndicator[]) {
            var $element = $(element);
            if ($element.length === 0) {
                window.console && console.warn('Warning: LoadingIndicator#constructor: Supplied element does not exist', element);
            } else {
                this.$element = $element;
            }
        }

        /**
         * Trigger the loading indicator, which will overlay the element and display a spinner. Call this as before
         * the async/slow operations begin.
         */
        start() {
            if (this.$element) {
                this.$element.addClass('tvc-loading');
                this.createOverlay();
                $(window).on('resize', $.proxy(this.matchDimensions, this));
                // calculate the dimensions on the next event loop in order to allow
                // time for layout changes as the page elements render.
                setTimeout(() => this.matchDimensions(), 0);
                // set up an interval to check for any size changes (e.g. scroll bar appearing/disappearing, etc)
                this.resizeInterval = setInterval(() => this.matchDimensions(), 50);
            }
            return this;
        }

        /**
         * Remove the loading indicator and spinner. Call this when the async/slow operations have all completed.
         */
        end() {
            if (this.$element) {
                this.$element.removeClass('tvc-loading');
                this.$overlay.fadeOut(() => this.$overlay.remove());
                $(window).off('resize', this.matchDimensions);
                clearInterval(this.resizeInterval);

                // remove this object from the registry array in order to free up the reference
                // and allow garbage collection
                this.registry.splice(this.registry.indexOf(this), 1);
            }
        }

        private createOverlay() {
            this.$overlay = $('<div>').addClass('tvc-loading-overlay');
            this.appendSpinnerTo(this.$overlay);
            $('body').append(this.$overlay);
        }

        private matchDimensions() {
            // if element width is 0, we assume it is no longer visible and
            // do not bother updating the dimentions of the overlay.
            if (0 < this.$element.outerWidth()) {
                var smallestDimension = Math.min(this.$element.outerWidth(), this.$element.outerHeight());
                if (smallestDimension < 120) {
                    var spinnerSize = smallestDimension - 10;
                    this.$spinner.css({
                        fontSize: spinnerSize,
                        marginTop: -spinnerSize / 2,
                        marginLeft: -spinnerSize / 2
                    });
                } else {
                    this.$spinner.removeAttr('style');
                }
                this.$overlay.css({
                    top: this.$element.offset().top - this.margin,
                    left: this.$element.offset().left - this.margin,
                    width: this.$element.outerWidth() + 2 * this.margin,
                    height: this.$element.outerHeight() + 2 * this.margin
                });
            }
        }

        private appendSpinnerTo($el: JQuery) {
            this.$spinner = $('<i class="fa fa-spinner fa-pulse"></i>').addClass('tvc-loading-spinner');
            $el.append(this.$spinner);
        }
    }

    /**
     * This service is used to display a loading indicator to give the user a visual cue that something is going on
     * in the background.
     *
     * It has a single method `createLoadingIndicator()` which returns an instance of the LoadingIndicator class which
     * will apply the overlay effect to the specified element.
     *
     * Usage:
     * ======
     * ```
     * var loader = LoadingService.createLoadingIndicator(<optional HTMLElement>).start();
     *
     * myAsyncService.makeSlowCall().
     *   .then(() => loader.end());
     * ```
     */
    export class LoadingService {

        private activeLoaders: LoadingIndicator[] = [];

        public createLoadingIndicator(element: JQuery | HTMLElement | Element = document.body) {
            var loader =  new LoadingIndicator(element, this.activeLoaders);
            this.activeLoaders.push(loader);
            return loader;
        }

        public cancelAll() {
            this.activeLoaders.map(loader => loader.end());
        }
    }

    angular.module('Common').service('LoadingService', LoadingService);

}
