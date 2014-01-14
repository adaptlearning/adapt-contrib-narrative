/*
* adapt-contrib-narrative
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Brian Quinn <brian@learningpool.com>
*/
define(function(require) {

	var ComponentView = require("coreViews/componentView");
	var Adapt = require("coreJS/adapt");

    var Narrative = ComponentView.extend({
        
        postRender: function() {
            this.setReadyStatus();
        },        
        events: function () {
            return Adapt.device.touch == true ? {
                'touchstart .narrative-slider' : 'navigateTouch',
                'touchstart .narrative-popup-open' : 'openNarrative',
                'click .narrative-popup-close' : 'closeNarrative'
                }:{
                'click .narrative-controls' : 'navigateClick',
                'click .narrative-popup-open' : 'openNarrative',
                'click .narrative-popup-close' : 'closeNarrative'
            }
        },
        setupNarrative: function() {
            if (!Adapt.device.touch) {
                this.model.set('_navigate', true);
                this.$el.addClass('desktop');
            } else {
                this.model.set('_navigate', false);
                this.$el.addClass('mobile');
            }            

            var slideCount = this.$('.narrative-slider-graphic', this.$el).length;
            var isSmallScreen = (Adapt.device.screenSize == 'small') ? true : false;
            this.model.set('_itemCount', slideCount);
            this.calculateWidths();

            this.$('.narrative-progress').first().addClass('selected');        
            this.$('.narrative-slide-container').css('overflow-x', 'hidden');
            this.$('.narrative-slider-graphic').first().addClass('visited');       
            this.$('.narrative-content-item').hide().first().show(); 

            this.model.set('_stage', 0);
            this.model.set('_active', true);

            this.toggleStrapline(isSmallScreen);

            this.evaluateNavigation();
            this.evaluateCompletion();
        },
        toggleStrapline: function(show) {
            var stage = this.model.get('_stage');

            if (show) {
                this.$('.narrative-strapline').show();
                this.$('.narrative-strapline-title').hide();
                this.$('narrative-strapline-title').eq(stage).show();
                this.$('.narrative-content').hide();
            }
            else {
                this.$('.narrative-strapline').hide();
                this.$('.narrative-content').show();
            }
        },
        calculateWidths: function() {
            if (this.model.get('_mobile') || Adapt.device.screenSize == 'small') {
                this.$('.narrative-slide-container').width('100%');
            } else {
                this.$('.narrative-slide-container').width('60%');
            }

            var slideWidth = this.$('.narrative-slide-container').width();
            var slideCount = this.model.get('_itemCount');
            var extraMargin = parseInt(this.$('.narrative-slider-graphic').css('margin-right'));

            this.$('.narrative-slider-graphic').width(slideWidth)
            this.$('.narrative-slider').width((slideWidth + extraMargin) * slideCount);

            // Get the current stage
            var stage = this.model.get('_stage');
            var margin = (stage * slideWidth) * -1;

            this.$('.narrative-slider').css('margin-left', margin);
        },
        resizeControl: function() {
            if (Adapt.device.screenSize == 'small') {
                this.model.set('_mobile', true);
                this.$el.addClass('mobile');
                this.$el.removeClass('desktop');
            }
            else {
                this.model.set('_mobile', false);
                this.$el.addClass('desktop');
                this.$el.removeClass('mobile');
            }

            this.calculateWidths();
            this.evaluateNavigation();
            this.toggleStrapline(this.model.get('_mobile'));
        },
        reRender: function() {
            if (this.model.get('_component') == 'hotgraphic' && (Adapt.device.screenSize != 'small')) {
                new Adapt.hotgraphic({model:this.model, $parent:this.$parent}).render();
                this.remove();
            } else {
                this.detectScreen();
                this.render();
                this.resizeControl();
                this.delegateEvents();
            }
        },
        detectScreen: function() {
            if (Adapt.device.screenSize != 'small') {
                this.model.set('_mobile', false);
            } else {
                this.model.set('_mobile', true);
            }
            
            if (Adapt.device.touch == false) {
                this.model.set('_navigate', true);
            } else {
                this.model.set('_navigate', false);
            }
        },
        preRender: function () {
            this.$el.addClass('clearfix');
            this.listenTo(Adapt, 'pageView:ready', this.setupNarrative, this);
            this.listenTo(Adapt, 'device:change', this.reRender, this);
            this.listenTo(Adapt, 'device:resize', this.resizeControl, this);

            this.detectScreen();

            this.setup();
        },
        setup: function() {
            this.$('.narrative-slider').imageready(_.bind(function(){
                this.setReadyStatus();
            }, this));
        },
        navigateClick: function (event) {
            event.preventDefault();
            if (!this.model.get('_active')) return;

            var extraMargin = parseInt(this.$('.narrative-slider-graphic').css('margin-right'));
            var movementSize = this.$('.narrative-slide-container').width() + extraMargin;
            var strapLineSize = this.$('.narrative-strapline-title').width();

            var stage = this.model.get('_stage');
            var itemCount = this.model.get('_itemCount');

            if ($(event.currentTarget).hasClass('narrative-control-right')) {
                if (stage < itemCount - 1) {
                    stage++;
                    this.$('.narrative-slider').stop().animate({'margin-left': - (movementSize * stage)});
                    if (!this.model.get('_mobile')) {
                        this.$('.narrative-slider-graphic').eq(stage).addClass('visited');
                        this.evaluateCompletion();
                    }
                } 
                else {
                    return;
                }
            }
            if ($(event.currentTarget).hasClass('narrative-control-left')) {
                if (stage > 0) {
                    stage--;
                    this.$('.narrative-slider').stop().animate({'margin-left': - (movementSize * stage)});
                }
            }
            this.model.set('_stage', stage);

            this.changeStage();
        },
        navigateTouch: function (event) {
            event.preventDefault();
            if (!this.model.get('_active')) return;
            var that = this,
                xOrigPos = event.originalEvent.touches[0]['pageX'],
                startPos = parseInt(this.$('.narrative-slider').css('margin-left')),
                xPos = event.originalEvent.touches[0]['pageX'],
                stage = this.model.get('_stage'),
                extraMargin = parseInt(this.$('.narrative-slider-graphic').css('margin-right')),
                movementSize = this.$('.narrative-slide-container').width() + extraMargin,
                narrativeSize = this.model.get('_itemCount'),
                strapLineSize = this.$('.narrative-strapline-title').width(),
                move;

            var onFirst = (stage == 0) ? true : false;
            var onLast = (stage == narrativeSize - 1) ? true : false;

            this.$('.narrative-slider').on('touchmove', function (event) {
                event.preventDefault();
                xPos = event.originalEvent.touches[0]['pageX'];

                // Ensure the user does not scroll beyond the bounds
                // of the narrative
                if (onFirst && (xOrigPos < xPos)) {
                    return;
                }
                if (onLast && (xOrigPos > xPos)) {
                    return;
                }

                if (xPos < xOrigPos) {
                    if (stage < narrativeSize - 1) {
                        move = (xPos + startPos) - xOrigPos;
                    } else {
                        move = (xPos - xOrigPos)/4 + (startPos);
                    }
                }
                if (xPos > xOrigPos) {
                    if (stage > 0) {
                        move = (xPos + startPos) - xOrigPos;
                    } else {
                        move = (xPos - xOrigPos)/4 + (startPos);
                    }
                }

                this.$('.narrative-slider').css('margin-left', move);
            });
            this.$('.narrative-slider').one('touchend', function (event) {
                $('.narrative-slider', that.$el).unbind('touchmove');
                if (xPos < xOrigPos) {
                    if (stage < narrativeSize - 1) {
                        stage++;
                        $('.narrative-slider', that.$el).animate({'margin-left': - (movementSize * stage)});
                        $('.narrative-strapline-header-inner', that.$el).animate({'margin-left': - (strapLineSize * stage)});
                    } else {
                        $('.narrative-slider', that.$el).animate({'margin-left': -(movementSize*stage)}, 400,'easeOutBack');
                    }
                }
                if (xPos > xOrigPos) {
                    if (stage > 0) {
                        stage--;
                        $('.narrative-slider', that.$el).animate({'margin-left': - (movementSize * stage)});
                        $('.narrative-strapline-header-inner', that.$el).animate({'margin-left': - (strapLineSize * stage)});
                    } else {
                        $('.narrative-slider', that.$el).animate({'margin-left': -(movementSize*stage)}, 400, 'easeOutBack');
                    }
                }
                
                that.model.set('_stage', stage);

                $('.narrative-content-item', that.$el).hide();
                $('.narrative-content-item', that.$el).eq(stage).show();
                $('.narrative-progress', that.$el).removeClass('selected').eq(stage).addClass('selected');
            });
        },
        changeStage: function() {
            var stage = this.model.get('_stage');
            this.evaluateNavigation();

            this.$('.narrative-progress').removeClass('selected').eq(stage).addClass('selected');
            this.$('.narrative-slider-graphic').children('.controls').attr('tabindex', -1);
            this.$('.narrative-slider-graphic').eq(stage).children('.controls').attr('tabindex', 0);
            this.$('.narrative-content-item').hide();
            this.$('.narrative-content-item').eq(stage).show();
            this.$('.narrative-strapline-title').hide();
            this.$('.narrative-strapline-title').eq(stage).show();
        },
        evaluateNavigation: function() {
            if (this.model.get('_navigate') == false) {
                this.$('.narrative-control-left').hide();
                this.$('.narrative-control-right').hide();
                return;
            } 

            var currentStage = this.model.get('_stage');
            var itemCount = this.model.get('_itemCount');


            if (currentStage == 0) {
                this.$('.narrative-control-left').hide();

                if (itemCount > 1) {
                    this.$('.narrative-control-right').show();
                }
            } else {
                this.$('.narrative-control-left').show();

                if (currentStage == itemCount - 1) {
                    this.$('.narrative-control-right').hide();
                } else {
                    this.$('.narrative-control-right').show();
                }
            }
        },
        evaluateCompletion: function() {
            if (this.$('.visited').length == this.model.get('_itemCount')) {
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
            this.$('.narrative-toolbar-title').hide();
            this.$('.narrative-toolbar-title').eq(this.model.get('_stage')).show();
            this.$('.narrative-popup-content').hide();
            this.$('.narrative-popup-content').eq(this.model.get('_stage')).show();
            this.$('.narrative-popup-inner').css('height', $(window).height() - (outerMargin * 2) - (innerPadding * 2));
            this.$('.narrative-popup').show();
            this.$('.narrative-popup-content').css('height', (this.$('.narrative-popup-inner').height() - toolBarHeight));

            this.evaluateCompletion();
        },
        closeNarrative: function (event) {
            event.preventDefault();
            this.model.set('_active', true);

            this.$('.narrative-popup-close').blur();
            this.$('.narrative-popup').hide();
        }
    });
    
    Adapt.register("narrative", Narrative);
    
});