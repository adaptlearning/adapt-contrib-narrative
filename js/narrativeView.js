define([
    'core/js/adapt',
    'core/js/views/componentDiffView'
], function(Adapt, ComponentDiffView) {

    var NarrativeView = ComponentDiffView.extend({

        renderAttributes: [
            "_isDesktop",
            "_hasNavigationInTextArea",
            "displayTitle",
            "body",
            "title",
            "_stage",
            "_items",
            "_slideWidth",
            "_fullSlideWidth",
            "_marginDir",
            "strapline",
            "_graphic",
            "_isComplete",
            "_canCycleThroughPagination"
        ],

        isVisibleTop: false,
        isVisibleBottom: false,

        completionEvent: null,

        postInitialize: function() {
            this.checkIfResetOnRevisit();
            this.setDeviceSize();
            this.replaceInstructions();
            this.setMarginDirection();
            this.setInitialStage();
            this.setUpEventListeners();
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (!isResetOnRevisit) return;
                
            this.model.checkIfResetOnRevisit();
            this.state.set("_stage", 0);
        },

        setMarginDirection: function() {
            var marginDirection = Adapt.config.get('_defaultDirection') === 'rtl' ? 
                'right': 
                'left';
            this.state.set("_marginDir", marginDirection);
        },

        setInitialStage: function() {
            this.setStage(this.state.get("_stage") || 0, true);
        },

        setUpEventListeners: function() {
            this.listenTo(Adapt, {
                'device:changed': this.checkReplaceWithHotgraphic,
                'device:resize': this.resizeControl,
                'notify:closed': this.closeNotify
            });
            this.setUpCompletionEvents();
        },

        setUpCompletionEvents: function() {
            this.completionEvent = (this.model.get('_setCompletionOn') || 'allItems');

            if (this.completionEvent === 'inview') {
                this.$el.on('inview', '.component-widget', _.bind(this.inview, this));
                return;
            }
            
            this.listenToOnce(this.model, this.completionEvent, this.onCompletion, this);
        },

        resizeControl: function() {
            this.setDeviceSize();
            this.replaceInstructions();
            this.calculateWidths();
            this.evaluateNavigation();
        },

        setDeviceSize: function() {
            this.state.set("_isDesktop", (Adapt.device.screenSize === 'large'));
        },

        replaceInstructions: function() {
            var instruction = (Adapt.device.screenSize === 'large') ? 
                this.model.get('instruction'):
                this.model.get('mobileInstruction');

            this.state.set("instruction", instruction);
        },

        calculateWidths: function() {
            var slideWidth = this.$('.narrative-slide-container').width();
            var slideCount = this.model.getItemsCount();
            var marginRight = this.$('.narrative-slider-graphic').css('margin-right');
            var extraMargin = marginRight === '' ? 0 : parseInt(marginRight);
            var fullSlideWidth = (slideWidth + extraMargin) * slideCount;
            var iconWidth = this.$('.narrative-popup-open').outerWidth();

            this.state.set("_slideWidth", slideWidth+"px");
            this.state.set("_fullSlideWidth", fullSlideWidth+"px");

            var stage = this.state.get("_stage");
            var margin = -(stage * slideWidth);

            this.state.set("_margin", margin);
        },
        

        checkReplaceWithHotgraphic: function() {
            if (this.model.get('_wasHotgraphic') && Adapt.device.screenSize == 'large') {
                this.replaceWithHotgraphic();
                return;
            }

            this.resizeControl();
        },

        replaceWithHotgraphic: function() {
            if (this._isRemoved) return;
            
            if (!Adapt.componentStore.hotgraphic) throw "Hotgraphic not included in build";
            var Hotgraphic = Adapt.componentStore.hotgraphic;
            
            this.model.set('_component', 'hotgraphic');

            var hotgraphicView = new Hotgraphic.view({ 
                "model": this.model 
            });

            var $container = $(".component-container", $("." + this.model.get("_parentId")));

            $container.append(hotgraphicView.$el);

            this.remove();
        },

        preRender: function() {
            this.evaluateNavigation();
        },

        events: {
            'click .narrative-strapline-title': 'openPopup',
            'click .narrative-controls': 'onNavigationClicked',
            'click .narrative-indicators .narrative-progress': 'onProgressClicked'
        },

        postRender: function() {
            this.$('.narrative-slider').imageready(_.bind(function() {
                this.calculateWidths();
                this.setUpNavigationInTextArea();
                this.setReadyStatus();
            }, this));
        },

        setUpNavigationInTextArea: function() {
            // if hasNavigationInTextArea set margin left 
            var hasNavigationInTextArea = this.model.get('_hasNavigationInTextArea');
            if (hasNavigationInTextArea !== true) return;

            var indicatorWidth = this.$('.narrative-indicators').width();
            var marginLeft = indicatorWidth / 2;
            
            this.state.set("_indicatorsMarginLeft", '-' + marginLeft);
        },

        openPopup: function(event) {
            event.preventDefault();

            var currentItem = this.model.getItem(this.state.get("_stage"));
            var popupObject = {
                title: currentItem.title,
                body: currentItem.body
            };

            // Set the visited attribute for small and medium screen devices
            currentItem._isVisited = true;

            Adapt.trigger('notify:popup', popupObject);
        },

        onNavigationClicked: function(event) {
            event.preventDefault();

            var button = $(event.currentTarget).data('button');

            var stage = this.state.get("_stage");
            var itemsCount = this.model.getItemsCount();

            switch (button) {
            case "right":
                stage++;
                break;
            case "left":
                stage--;
                break;
            }

            var allowCycle = this.model.get("_canCycleThroughPagination");
            var isPreFirst = (stage < 0);
            var isPostLast = (stage >= itemsCount);

            if (isPreFirst) stage = allowCycle ?
                itemsCount-1:
                0;

            if (isPostLast) stage = allowCycle ?
                0:
                itemsCount-1

            this.setStage(stage);
        },
        
        onProgressClicked: function(event) {
            event.preventDefault();
            var clickedIndex = $(event.target).index();
            this.setStage(clickedIndex);
        },

        setStage: function(stage, initial) {
            this.state.set("_stage", stage);

            if (this.state.get("_isDesktop")) {
                // Set the visited attribute for large screen devices
                var currentItem = this.model.getItem(stage);
                currentItem._isVisited = true;
            }

            this.model.evaluateCompletion();

            this.evaluateNavigation();

            this.moveSliderToIndex(stage, !initial);

            this.listenToOnce(this, "postRender", function() {
                if (!initial) return;

                if (this.state.get("_isDesktop")) {
                    this.$('.narrative-content-item').eq(stage).a11y_focus();
                } else {
                    this.$('.narrative-popup-open').a11y_focus();
                }

            });

        },

        evaluateNavigation: function() {
            var currentStage = this.state.get("_stage");
            var itemsCount = this.model.getItemsCount();

            var allowCycle = this.model.get("_canCycleThroughPagination");
            var isFirst = (currentStage === 0);
            var isLast = (currentStage === itemsCount-1);
            var isMiddle = (!isFirst && !isLast);

            this.state.set({
                _showLeft: allowCycle || isLast || isMiddle,
                _showRight: allowCycle || isFirst || isMiddle
            });

        },

        moveSliderToIndex: function(itemIndex) {
            var extraMargin = parseInt(this.$('.narrative-slider-graphic').css('margin-right'));
            var movementSize = this.$('.narrative-slide-container').width() + extraMargin;
            this.state.set("_margin", -(movementSize * itemIndex));
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (!visible) return;

            switch (visiblePartY) {
            case 'top':
                this.isVisibleTop = true;
                break;
            case 'bottom':
                this.isVisibleBottom = true;
                break;
            case 'both':
                this.isVisibleTop = true;
                this.isVisibleBottom = true;
            }

            if (!this.isVisibleTop || !this.isVisibleBottom) return;

            this.$el.off('inview', '.component-widget');

            this.setCompletionStatus();
        },

        onCompletion: function() {
            this.setCompletionStatus();

            if (this.completionEvent === 'inview') return;
            
            this.stopListening(this.completionEvent, this);
        },

        closeNotify: function() {
            this.model.evaluateCompletion()
        }
        
    });

    return NarrativeView;

});
