/*
* adapt-contrib-narrative
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Brian Quinn <brian@learningpool.com>, Daryl Heldey <darylhedley@hotmail.com>
*/
define(function(require) {

	var ComponentView = require("coreViews/componentView");
	var Adapt = require("coreJS/adapt");

    var Narrative = ComponentView.extend({
        
        events: function () {
            return Adapt.device.touch == true ? {
                'touchstart .narrative-slider' : 'navigateTouch',
                'touchstart .narrative-popup-open' : 'openNarrative',
                'click .narrative-popup-close' : 'closeNarrative',
                'click .narrative-controls' : 'navigateClick',
            }:{
                'click .narrative-controls' : 'navigateClick',
                'click .narrative-popup-open' : 'openNarrative',
                'click .narrative-popup-close' : 'closeNarrative'
            }
        },

        preRender: function () {
            this.listenTo(Adapt, 'pageView:ready', this.setupNarrative, this);
            this.listenTo(Adapt, 'device:changed', this.reRender, this);
            this.listenTo(Adapt, 'device:resize', this.resizeControl, this);
            this.setDeviceSize();
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
            this.$('.narrative-slider').imageready(_.bind(function(){
                this.setReadyStatus();
            }, this));
        }, 

        setupNarrative: function() {
            this.setDeviceSize();
            var slideCount = this.$('.narrative-slider-graphic', this.$el).length;
            this.model.set('_itemCount', slideCount);
            this.calculateWidths();

            this.model.set('_active', true);

            if (this.model.get('_stage')) {
                this.setStage(this.model.get('_stage'));
            } else {
                this.setStage(0);
            }
        },

        calculateWidths: function() {
            var slideWidth = this.$('.narrative-slide-container').width();
            var slideCount = this.model.get('_itemCount');
            var extraMargin = parseInt(this.$('.narrative-slider-graphic').css('margin-right'));

            this.$('.narrative-slider-graphic').width(slideWidth)
            this.$('.narrative-slider').width((slideWidth + extraMargin) * slideCount);

            var stage = this.model.get('_stage');
            var margin = -(stage * slideWidth);

            this.$('.narrative-slider').css('margin-left', margin);
        },

        resizeControl: function() {
            this.setDeviceSize();
            this.calculateWidths();
            this.evaluateNavigation();
        },

        reRender: function() {
            if (this.model.get('_wasHotgraphic') && Adapt.device.screenSize != 'small') {
                this.replaceWithHotgraphic();
            }
        },

        replaceWithHotgraphic: function () {
            var Hotgraphic = require('components/adapt-contrib-hotgraphic/js/adapt-contrib-hotgraphic');
            var model = this.prepareHotgraphicModel();
            var newHotgraphic = new Hotgraphic({model:model, $parent: this.options.$parent});
            this.options.$parent.append(newHotgraphic.$el);
            Adapt.trigger('device:resize');
            this.remove();
        },

        prepareHotgraphicModel: function() {
          var model = this.model;
          model.set('_component', 'hotgraphic');
          model.set('body', model.get('originalBody'));
          return model;
        },

        navigateClick: function (event) {
            event.preventDefault();
            if (!this.model.get('_active')) return;

            var extraMargin = parseInt(this.$('.narrative-slider-graphic').css('margin-right'));
            var movementSize = this.$('.narrative-slide-container').width() + extraMargin;

            var stage = this.model.get('_stage');
            var itemCount = this.model.get('_itemCount');

            if ($(event.currentTarget).hasClass('narrative-control-right')) {
                this.navigateRight(stage, itemCount, movementSize);
            }
            if ($(event.currentTarget).hasClass('narrative-control-left')) {
                this.navigateLeft(stage, movementSize);
            }
        },

        navigateRight: function(stage, itemCount, movementSize) {
            if (stage < itemCount - 1) {
                stage++;
                this.$('.narrative-slider').stop().animate({'margin-left': - (movementSize * stage)});
                if (this.model.get('_isDesktop')) {
                    this.$('.narrative-slider-graphic').eq(stage).addClass('visited');
                }

                this.setStage(stage);
            }            
        },

        navigateLeft: function(stage, movementSize) {
            if (stage > 0) {
                stage--;
                this.$('.narrative-slider').stop().animate({'margin-left': - (movementSize * stage)});

                this.setStage(stage);
            }            
        },

        setStage: function(stage) {
            this.model.set('_stage', stage);

            // Set the visited attribute
            var currentItem = this.model.get('items')[stage];
            currentItem.visited = true;

            this.$('.narrative-progress').removeClass('selected').eq(stage).addClass('selected');
            this.$('.narrative-slider-graphic').children('.controls').attr('tabindex', -1);
            this.$('.narrative-slider-graphic').eq(stage).children('.controls').attr('tabindex', 0);
            this.$('.narrative-content-item').addClass('narrative-hidden').eq(stage).removeClass('narrative-hidden');
            this.$('.narrative-strapline-title').addClass('narrative-hidden').eq(stage).removeClass('narrative-hidden');

            this.evaluateNavigation();
            this.evaluateCompletion();
        },

        navigateSwipe: function(el, stage) {
            var extraMargin = parseInt(this.$('.narrative-slider-graphic').css('margin-right'));
            var strapLineSize = this.$('.narrative-strapline-title').width();
            var movementSize = this.$('.narrative-slide-container').width() + extraMargin;

            $('.narrative-slider', el).animate({'margin-left': - (movementSize * stage)});
            $('.narrative-strapline-header-inner', el).animate({'margin-left': - (strapLineSize * stage)});

            if (this.model.get('_isDesktop')) {
                this.$('.narrative-slider-graphic').eq(stage).addClass('visited');
            }
            
            this.setStage(stage);
        },

        navigateTouch: function(event) {
            event.preventDefault();
            if (!this.model.get('_active')) return;

            var that = this;
            var xOrigPos = event.originalEvent.touches[0]['pageX'];
            var startPos = parseInt(this.$('.narrative-slider').css('margin-left'));
            var stage = this.model.get('_stage');
            var narrativeSize = this.model.get('_itemCount');
            var move;
            var xPos;
            var onFirst = (stage == 0) ? true : false;
            var onLast = (stage == narrativeSize - 1) ? true : false;
            var swipeLeft = false;
            var swipeRight = false;

            this.$('.narrative-slider').on('touchmove', _.bind(function(event) {
                event.preventDefault();
                xPos = event.originalEvent.touches[0]['pageX'];
                swipeLeft = (xOrigPos > xPos) ? true : false;
                swipeRight = (xOrigPos < xPos) ? true : false;

                // Ensure the user does not scroll beyond the bounds
                if (onFirst && swipeRight || onLast && swipeLeft) return;
                
                if (swipeRight && !onLast || swipeLeft && !onFirst) {
                    move = (xPos + startPos) - xOrigPos;  
                }
                else {
                    move = (xPos - xOrigPos)/4 + (startPos);
                }

                this.$('.narrative-slider').css('margin-left', move);
            }, this));

            this.$('.narrative-slider').one('touchend', _.bind(function (event) {
                $('.narrative-slider', that.$el).unbind('touchmove');

                if (swipeRight || swipeLeft) {
                    if (swipeLeft && !onLast) stage++;
                    if (swipeRight && !onFirst) stage--;
                } else {
                    return;
                }
                
                that.navigateSwipe(that.$el, stage);
            }, this));
        },

        evaluateNavigation: function() {
            var currentStage = this.model.get('_stage');
            var itemCount = this.model.get('_itemCount');

            if (currentStage == 0) {
                this.$('.narrative-control-left').addClass('narrative-hidden');

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
            if (this.$('.visited').length == this.model.get('items').length) {
                this.setCompletionStatus();
            }
        },

        openNarrative: function (event) {
            event.preventDefault();
            this.model.set('_active', false);

            var outerMargin = parseFloat(this.$('.narrative-popup-inner').css('margin'));
            var innerPadding = parseFloat(this.$('.narrative-popup-inner').css('padding'));
            var toolBarHeight = this.$('.narrative-toolbar').height();

            this.$('.narrative-slider-graphic').eq(this.model.get('_stage')).addClass('visited');
            this.$('.narrative-popup-toolbar-title').addClass('narrative-hidden').eq(this.model.get('_stage')).removeClass('narrative-hidden');
            this.$('.narrative-popup-content').addClass('narrative-hidden').eq(this.model.get('_stage')).removeClass('narrative-hidden');
            this.$('.narrative-popup-inner').css('height', $(window).height() - (outerMargin * 2) - (innerPadding * 2));
            this.$('.narrative-popup').removeClass('narrative-hidden');
            this.$('.narrative-popup-content').css('height', (this.$('.narrative-popup-inner').height() - toolBarHeight));
        },

        closeNarrative: function (event) {
            event.preventDefault();
            this.model.set('_active', true);

            this.$('.narrative-popup-close').blur();
            this.$('.narrative-popup').addClass('narrative-hidden');
            
            this.evaluateCompletion();
        }
    });
    
    Adapt.register("narrative", Narrative);
    
    return Narrative;

});