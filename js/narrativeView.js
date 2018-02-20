define([
    'core/js/adapt',
    'core/js/views/componentView'
], function(Adapt, ComponentView) {
    'use strict';
    
    var NarrativeView = ComponentView.extend({
        
        events: {
            'click .narrative-strapline-title': 'openPopup',
            'click .narrative-controls': 'onNavigationClicked',
            'click .narrative-indicators .narrative-progress': 'onProgressClicked'
        },

        preRender: function() {
            this.listenTo(Adapt, {
                'device:changed': this.reRender,
                'device:resize': this.resizeControl,
                'notify:closed': this.closeNotify
            });
            this.setDeviceSize();

            this.listenTo(this.model.get('_items'), {
                'change:_isActive': this.onItemsActiveChange
            });

            // Checks to see if the narrative should be reset on revisit
            this.checkIfResetOnRevisit();
            this._isInitial = true;
            this.calculateWidths();
            _.bindAll(this, 'onTransitionEnd');
        },

        onItemsActiveChange: function(item, _isActive) {
            if (_isActive === true) {
                this.setStage(item);
            }
        },

        setDeviceSize: function() {
            if (Adapt.device.screenSize === 'large') {
                this.$el.addClass('desktop').removeClass('mobile');
                this.model.set('_isDesktop', true);
            } else {
                this.$el.addClass('mobile').removeClass('desktop');
                this.model.set('_isDesktop', false)
            }
        },

        postRender: function() {
            this.renderState();
            this.$('.narrative-slider').imageready(_.bind(function() {
                this.setReadyStatus();
            }, this));
            this.setupNarrative();

            if (Adapt.config.get('_disableAnimation')) {
                this.$el.addClass('disable-animation');
            }
        },

        // Used to check if the narrative should reset on revisit
        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');
            
            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        setupNarrative: function() {
            this.setDeviceSize();
            if (!this.model.has('_items') || !this.model.get('_items').length) return;

            this.model.set('_active', true);
            
            var activeItem = this.model.getActiveItem();
            if (!activeItem) {
                activeItem = this.model.getItem(0);
                activeItem.toggleActive(true);
            } else {
                // manually trigger change as it is not fired on reentry
                this.model.get('_items').trigger('change:_isActive', activeItem, true);
            }

            this.calculateWidths();

            if (Adapt.device.screenSize !== 'large' && !this.model.get('_wasHotgraphic')) {
                this.replaceInstructions();
            }
            this.setupEventListeners();
            this._isInitial = false;
        },

        calculateWidths: function() {
            var itemCount = this.model.get('_items').length;
            this.model.set('_totalWidth', 100 * itemCount);
            this.model.set('_itemWidth', 100 / itemCount);
        },

        resizeControl: function() {
            var wasDesktop = this.model.get('_isDesktop');
            this.setDeviceSize();
            if (wasDesktop != this.model.get('_isDesktop')) this.replaceInstructions();
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
            this.evaluateCompletion()
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
            var HotgraphicView = Adapt.componentStore.hotgraphic.view;
            
            var model = this.prepareHotgraphicModel();
            var newHotgraphic = new HotgraphicView({ model: model });
            var $container = $(".component-container", $("." + this.model.get("_parentId")));

            $container.append(newHotgraphic.$el);
            this.remove();
            $.a11y_update();
            _.defer(function() {
                Adapt.trigger('device:resize');
            });
        },

        prepareHotgraphicModel: function() {
            var model = this.model;
            model.resetActiveItems();
            model.set({
                '_isPopupOpen': false,
                '_component': 'hotgraphic',
                'body': model.get('originalBody'),
                'instruction': model.get('originalInstruction')
            });

            return model;
        },

        moveSliderToIndex: function(itemIndex, shouldAnimate) {
            var invert = (Adapt.config.get('_defaultDirection') === 'ltr') ? 1 : -1;

            var offset = 100 / this.model.get('_items').length * itemIndex * -1 * invert;
            var cssValue = 'translateX('+offset+'%)';
            var sliderElm = this.$('.narrative-slider')[0];
            var straplineHeaderElm = this.$('.narrative-strapline-header-inner')[0];

            this.prefixHelper(sliderElm, 'Transform', cssValue);
            sliderElm.style.transform = cssValue;
            
            this.prefixHelper(straplineHeaderElm, 'Transform', cssValue);
            straplineHeaderElm.style.transform = cssValue;

            if (Adapt.config.get('_disableAnimation')) {
                this.onTransitionEnd();
            } else {
                sliderElm.addEventListener('transitionend', this.onTransitionEnd);
            }
        },

        onTransitionEnd: function(event) {
            if (event) {
                event.currentTarget.removeEventListener('transitionend', this.onTransitionEnd);
            }
            
            var index = this.model.getActiveItem().get('_index');
            if (this.model.get('_isDesktop')) {
                if (!this._isInitial) {
                    this.$('.narrative-content-item').eq(index).a11y_focus();
                }
            } else {
                if (!this._isInitial) {
                    this.$('.narrative-strapline-title').a11y_focus();
                }
            }
        },

        prefixHelper: function(elm, prop, val) {
            elm.style['webkit' + prop] = val;
            elm.style['ms' + prop] = val;
            // moz should be fine for transforms 
        },

        setStage: function(item) {
            var index = item.get('_index');
            if (this.model.get('_isDesktop')) {
                // Set the visited attribute for large screen devices
                item.toggleVisited(true);
            }

            this.$('.narrative-progress:visible').removeClass('selected').eq(index).addClass('selected');
            this.$('.narrative-slider-graphic').children('.controls').a11y_cntrl_enabled(false);
            this.$('.narrative-slider-graphic').eq(index).children('.controls').a11y_cntrl_enabled(true);
            this.$('.narrative-content-item').addClass('narrative-hidden').a11y_on(false).eq(index).removeClass('narrative-hidden').a11y_on(true);
            this.$('.narrative-strapline-title').a11y_cntrl_enabled(false).eq(index).a11y_cntrl_enabled(true);

            this.evaluateNavigation();
            this.evaluateCompletion();
            this.moveSliderToIndex(index, !this._isInitial);
        },

        evaluateNavigation: function() {
            var active = this.model.getActiveItem();
            if (!active) return;

            var currentStage = active.get('_index');
            var itemCount = this.model.get('_items').length;
            if (currentStage == 0) {
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
            if (this.model.areAllItemsCompleted()) {
                this.trigger('allItems');
            } 
        },

        openPopup: function(event) {
            event && event.preventDefault();

            var currentItem = this.model.getActiveItem();

            // Set the visited attribute for small and medium screen devices
            currentItem.toggleVisited(true);

            Adapt.trigger('notify:popup', {
                title: currentItem.get('title'),
                body: currentItem.get('body')
            });
        },

        onNavigationClicked: function(event) {
            if (!this.model.get('_active')) return;

            var stage = this.model.getActiveItem().get('_index');
            var numberOfItems = this.model.get('_items').length;

            if ($(event.currentTarget).hasClass('narrative-control-right')) {
                stage++;
                this.model.setActiveItem(stage);
            } else if ($(event.currentTarget).hasClass('narrative-control-left')) {
                stage--;
                this.model.setActiveItem(stage);
            }
            stage = (stage + numberOfItems) % numberOfItems;
        },
        
        onProgressClicked: function(event) {
            event && event.preventDefault();
            var clickedIndex = $(event.target).index();
            this.model.setActiveItem(clickedIndex);
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

        setupEventListeners: function() {
            if (this.model.get('_setCompletionOn') === 'inview') {
                this.$('.component-widget').on('inview', _.bind(this.inview, this));
            }
        },

        remove: function() {
            if (this.model.get('_setCompletionOn') === 'inview') {
                this.$('.component-widget').off('inview');
            }
            ComponentView.prototype.remove.apply(this, arguments);
        },

        getSlideDirection: function() {
            var direction = 'left';
            if (Adapt.config.has('_defaultDirection') && Adapt.config.get('_defaultDirection') === 'rtl') {
                direction = 'right';
            }
            return direction;
        }

    });

    return NarrativeView;

});