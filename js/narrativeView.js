define([
    'coreJS/adapt',
    'coreViews/componentView'
], function(Adapt, ComponentView) {

    var NarrativeView = ComponentView.extend({

        events: {
            'click .narrative-strapline-title': 'openPopup',
            'click .narrative-controls': 'onNavigationClicked',
            'click .narrative-indicators .narrative-progress': 'onProgressClicked'
        },

        preRender: function() {
            this.listenTo(Adapt, 'device:changed', this.reRender, this);
            this.listenTo(Adapt, 'device:resize', this.resizeControl, this);
            this.listenTo(Adapt, 'notify:closed', this.closeNotify, this);
            this.listenTo(this.model, 'change:_activeItem', this.onActiveItemChanged);
            this.setDeviceSize();

            // Checks to see if the narrative should be reset on revisit
            this.checkIfResetOnRevisit();
        },

        setDeviceSize: function() {
            if (Adapt.device.screenSize === 'large') {
                this.$el.addClass('desktop').removeClass('mobile');
                this.model.set('_isDesktop', true);
            } else {
                this.$el.addClass('mobile').removeClass('desktop');
                this.model.set('_isDesktop', false);
            }
        },

        postRender: function() {
            this.renderState();
            this.$('.narrative-slider').imageready(_.bind(function() {
                this.setReadyStatus();
            }, this));
            this.setupNarrative();
        },

        // Used to check if the narrative should reset on revisit
        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
                this.model.set({_activeItem: 0});
                this.model.resetItems();
            }
        },

        setupNarrative: function() {
            this.setDeviceSize();
            if(!this.model.has('_items') || !this.model.get('_items').length) return;
            this.model.set('_active', true);
            this.setStage(this.model.get('_activeItem'), true);
            this.calculateWidths();

            if (Adapt.device.screenSize !== 'large' && !this.model.get('_wasHotgraphic')) {
                this.replaceInstructions();
            }
            this.setupEventListeners();
            
            // if hasNavigationInTextArea set margin left
            if (this.model.get('_hasNavigationInTextArea') === true) {
                var indicatorWidth = this.$('.narrative-indicators').width();
                var marginLeft = indicatorWidth / 2;
                
                this.$('.narrative-indicators').css({
                    marginLeft: '-' + marginLeft + 'px'
                });
            }
        },

        calculateWidths: function() {
            var slideWidth = this.$('.narrative-slide-container').width();
            var slideCount = this.model.get('_itemCount');
            var marginRight = this.$('.narrative-slider-graphic').css('margin-right');
            var extraMargin = marginRight === '' ? 0 : parseInt(marginRight);
            var fullSlideWidth = (slideWidth + extraMargin) * slideCount;

            this.$('.narrative-slider-graphic').width(slideWidth);
            this.$('.narrative-strapline-header').width(slideWidth);
            this.$('.narrative-strapline-title').width(slideWidth);

            this.$('.narrative-slider').width(fullSlideWidth);
            this.$('.narrative-strapline-header-inner').width(fullSlideWidth);

            var stage = this.model.get('_activeItem');
            var margin = -(stage * slideWidth);

            this.$('.narrative-slider').css(('margin-' + this.model.get('_marginDir')), margin);
            this.$('.narrative-strapline-header-inner').css(('margin-' + this.model.get('_marginDir')), margin);

            this.model.set('_finalItemLeft', fullSlideWidth - slideWidth);
        },

        resizeControl: function() {
            var wasDesktop = this.model.get('_isDesktop');
            this.setDeviceSize();
            if (wasDesktop != this.model.get('_isDesktop')) this.replaceInstructions();
            this.calculateWidths();
            this.evaluateNavigation();
        },

        reRender: function() {
            if (this.model.get('_wasHotgraphic') && Adapt.device.screenSize == 'large') {
                this.replaceWithHotgraphic();
            } else {
                this.resizeControl();
            }
        },

        closeNotify: function() {
            this.evaluateCompletion();
        },

        replaceInstructions: function() {
            if (Adapt.device.screenSize === 'large') {
                this.$('.narrative-instruction-inner').html(this.model.get('instruction')).a11y_text();
            } else if (this.model.get('mobileInstruction') && !this.model.get('_wasHotgraphic')) {
                this.$('.narrative-instruction-inner').html(this.model.get('mobileInstruction')).a11y_text();
            }
        },

        replaceWithHotgraphic: function() {
            if (!Adapt.componentStore.hotgraphic) throw "Hotgraphic not included in build";
            
            var hotgraphicModel = Adapt.componentStore.hotgraphic.model.prototype.prepareHotgraphicModel.call(this.model);
            var hotgraphicView = new Adapt.componentStore.hotgraphic.view({
                model: hotgraphicModel
            });
            
            var $container = $(".component-container", $("." + this.model.get("_parentId")));

            $container.append(hotgraphicView.$el);
            this.remove();
            $.a11y_update();
            _.defer(function() {
                Adapt.trigger('device:resize');
            });
        },

        moveSliderToIndex: function(itemIndex, animate, callback) {
            var extraMargin = parseInt(this.$('.narrative-slider-graphic').css('margin-right'));
            var movementSize = this.$('.narrative-slide-container').width() + extraMargin;
            var marginDir = {};
            if (animate && !Adapt.config.get('_disableAnimation')) {
                marginDir['margin-' + this.model.get('_marginDir')] = -(movementSize * itemIndex);
                this.$('.narrative-slider').velocity("stop", true).velocity(marginDir);
                this.$('.narrative-strapline-header-inner').velocity("stop", true).velocity(marginDir, {complete:callback});
            } else {
                marginDir['margin-' + this.model.get('_marginDir')] = -(movementSize * itemIndex);
                this.$('.narrative-slider').css(marginDir);
                this.$('.narrative-strapline-header-inner').css(marginDir);
                callback();
            }
        },

        onActiveItemChanged: function(model, activeItem, options) {
            if (activeItem >= 0 && activeItem < this.model.get('_items').length)
                this.setStage(activeItem);
        },

        setStage: function(stage, initial) {
            if (this.model.get('_isDesktop')) {
                // Set the visited attribute for large screen devices
                this.model.setItemAsVisited(stage);
            }

            this.$('.narrative-progress:visible').removeClass('selected').eq(stage).addClass('selected');
            this.$('.narrative-slider-graphic').children('.controls').a11y_cntrl_enabled(false);
            this.$('.narrative-slider-graphic').eq(stage).children('.controls').a11y_cntrl_enabled(true);
            this.$('.narrative-content-item').addClass('narrative-hidden').a11y_on(false).eq(stage).removeClass('narrative-hidden').a11y_on(true);
            this.$('.narrative-strapline-title').a11y_cntrl_enabled(false).eq(stage).a11y_cntrl_enabled(true);

            this.evaluateNavigation();
            this.evaluateCompletion();

            this.moveSliderToIndex(stage, !initial, _.bind(function() {
                if (this.model.get('_isDesktop')) {
                    if (!initial) this.$('.narrative-content-item').eq(stage).a11y_focus();
                } else {
                    if (!initial) this.$('.narrative-strapline-title').a11y_focus();
                }
            }, this));
        },

        evaluateNavigation: function() {
            var currentStage = this.model.get('_activeItem');
            var itemCount = this.model.get('_itemCount');
            if (currentStage === 0) {
                this.$('.narrative-controls').addClass('narrative-hidden');

                if (itemCount > 1) {
                    this.$('.narrative-control-right').removeClass('narrative-hidden');
                }
            } else {
                this.$('.narrative-control-left').removeClass('narrative-hidden');

                if (currentStage == itemCount - 1) {
                    this.$('.narrative-control-right').addClass('narrative-hidden');
                } else {
                    this.$('.narrative-control-right').removeClass('narrative-hidden');
                }
            }

        },

        evaluateCompletion: function() {
            if (this.model.getVisitedItems().length === this.model.get('_items').length) {
                this.trigger('allItems');
            }
        },

        openPopup: function(event) {
            event.preventDefault();
            var currentItem = this.model.getCurrentItem(this.model.get('_activeItem'));
            var popupObject = {
                title: currentItem.title,
                body: currentItem.body
            };

            // Set the visited attribute for small and medium screen devices
            currentItem._isVisited = true;

            Adapt.trigger('notify:popup', popupObject);
        },

        onNavigationClicked: function(event) {

            if (!this.model.get('_active')) return;

            var stage = this.model.get('_activeItem');
            var numberOfItems = this.model.get('_itemCount');

            if ($(event.currentTarget).hasClass('narrative-control-right')) {
                stage++;
            } else if ($(event.currentTarget).hasClass('narrative-control-left')) {
                stage--;
            }
            stage = (stage + numberOfItems) % numberOfItems;
            this.model.set('_activeItem', stage);
        },
        
        onProgressClicked: function(event) {
            event.preventDefault();
            var clickedIndex = $(event.target).index();
            this.model.set('_activeItem', clickedIndex);
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$('.component-inner').off('inview');
                    this.setCompletionStatus();
                }
            }
        },

        onCompletion: function() {
            this.setCompletionStatus();
            if (this.completionEvent && this.completionEvent != 'inview') {
                this.off(this.completionEvent, this);
            }
        },

        setupEventListeners: function() {
            this.completionEvent = (!this.model.get('_setCompletionOn')) ? 'allItems' : this.model.get('_setCompletionOn');
            if (this.completionEvent !== 'inview' && this.model.get('_items').length > 1) {
                this.on(this.completionEvent, _.bind(this.onCompletion, this));
            } else {
                this.$('.component-widget').on('inview', _.bind(this.inview, this));
            }
        }

    });

    return NarrativeView;

});
