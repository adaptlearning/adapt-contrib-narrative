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
        init: function () {
            this.$el.addClass('clearfix');
            this.listenTo(Adapt, 'pageView:ready', this.setupNarrative, this);
            this.listenTo(Adapt, 'device:change', this.reRender, this);
            this.listenTo(Adapt, 'device:resize', this.resizeControl, this);
        },
        events: function () {
            return Adapt.device.touch == true ? {
                'touchstart .narrative-slider' : 'navigateTouch',
                'touchstart .narrative-popup-open' : 'openNarrative',
                'click .narrative-popup-close' : 'closeNarrative'
                }:{
                'click .controls' : 'navigateClick',
                'click .narrative-popup-open' : 'openNarrative',
                'click .narrative-popup-close' : 'closeNarrative'
            }
        },
        setupNarrative: function() {
            if (!Adapt.device.touch) {
                this.model.set('navigate', true);
                this.$el.addClass('desktop');
            } else {
                this.model.set('navigate', false);
                this.$el.addClass('mobile');
            }            

            var slideCount = this.$('.narrative-graphic', this.$el).length;
            var isSmallScreen = (Adapt.device.screenSize == 'small') ? true : false;
            this.model.set('itemCount', slideCount);
            this.calculateWidths();

            this.$('.narrative-widget .narrative-slide-container .narrative-indicators .button').first().addClass('selected');        
            this.$('.narrative-widget .narrative-slide-container').css('overflow-x', 'hidden');
            this.$('.narrative-widget .narrative-graphic').first().addClass('visited');       
            this.$('.narrative-widget .narrative-content .item').hide().first().show(); 

            this.model.set('stage', 0);
            this.model.set('active', true);

            this.toggleStrapline(isSmallScreen);

            this.evaluateNavigation();
            this.evaluateCompletion();
        },
        toggleStrapline: function(show) {
            var stage = this.model.get('stage');

            if (show) {
                this.$('.narrative-strapline').show();
                this.$('.header .inner .title').hide();
                this.$('.header .inner .title').eq(stage).show();
                this.$('.narrative-content').hide();
            }
            else {
                this.$('.narrative-strapline').hide();
                this.$('.narrative-content').show();
            }
        },
        calculateWidths: function() {
            if (this.model.get('mobile') || Adapt.device.screenSize == 'small') {
                this.$('.narrative-slide-container').width('100%');
            } else {
                this.$('.narrative-slide-container').width('60%');
            }

            var slideWidth = this.$('.narrative-slide-container').width();
            var slideCount = this.model.get('itemCount');
            var extraMargin = parseInt(this.$('.narrative-graphic').css('margin-right'));

            this.$('.narrative-slider .narrative-graphic').width(slideWidth)
            this.$('.narrative-slider').width((slideWidth + extraMargin) * slideCount);

            // Get the current stage
            var stage = this.model.get('stage');
            var margin = (stage * slideWidth) * -1;

            this.$('.narrative-slider').css('margin-left', margin);
        },
        resizeControl: function() {
            if (Adapt.device.screenSize == 'small') {
                this.model.set('mobile', true);
                this.$el.addClass('mobile');
                this.$el.removeClass('desktop');
            }
            else {
                this.model.set('mobile', false);
                this.$el.addClass('desktop');
                this.$el.removeClass('mobile');
            }

            this.calculateWidths();
            this.toggleStrapline(this.model.get('mobile'));
        },
        reRender: function() {
            if (this.model.get('component') == 'hotgraphic' && (Adapt.device.screenSize != 'small')) {
                new Adapt.hotgraphic({model:this.model, $parent:this.$parent}).render();
                this.remove();
            } else {
                this.preRender();
                this.render();
                this.resizeControl();
                this.delegateEvents();
            }
        },
        preRender: function () {
            if (Adapt.device.screenSize != 'small') {
                this.model.set('mobile', false);
            } else {
                this.model.set('mobile', true);
            }
            
            if (Adapt.device.touch == false) {
                this.model.set('navigate', true);
            }
        },
        setup: function() {
            this.$('.narrative-slider').imageready(_.bind(function(){
                this.setReadyStatus();
            }, this));
        },
        navigateClick: function (event) {
            event.preventDefault();
            if (!this.model.get('active')) return;

            var extraMargin = parseInt(this.$('.narrative-graphic').css('margin-right'));
            var movementSize = this.$('.narrative-slide-container').width() + extraMargin;
            var strapLineSize = this.$('.narrative-strapline .title').width();

            var stage = this.model.get('stage');
            var itemCount = this.model.get('itemCount');

            if ($(event.currentTarget).hasClass('narrative-control-right')) {
                if (stage < itemCount - 1) {
                    stage++;
                    this.$('.narrative-slider').stop().animate({'margin-left': - (movementSize * stage)});
                    if (!this.model.get('mobile')) {
                        this.$('.narrative-graphic').eq(stage).addClass('visited');
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
            this.model.set('stage', stage);

            this.changeStage();
        },
        navigateTouch: function (event) {
            event.preventDefault();
            if (!this.model.get('active')) return;
            var that = this,
                xOrigPos = event.originalEvent.touches[0]['pageX'],
                startPos = parseInt(this.$('.narrative-slider').css('margin-left')),
                xPos = event.originalEvent.touches[0]['pageX'],
                stage = this.model.get('stage'),
                extraMargin = parseInt(this.$('.narrative-graphic').css('margin-right')),
                movementSize = this.$('.narrative-slide-container').width() + extraMargin,
                narrativeSize = this.model.get('itemCount'),
                strapLineSize = this.$('.narrative-strapline .title').width(),
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
                        $('.narrative-strapline .header > .inner', that.$el).animate({'margin-left': - (strapLineSize * stage)});
                    } else {
                        $('.narrative-slider', that.$el).animate({'margin-left': -(movementSize*stage)}, 400,'easeOutBack');
                    }
                }
                if (xPos > xOrigPos) {
                    if (stage > 0) {
                        stage--;
                        $('.narrative-slider', that.$el).animate({'margin-left': - (movementSize * stage)});
                        $('.narrative-strapline .header > .inner', that.$el).animate({'margin-left': - (strapLineSize * stage)});
                    } else {
                        $('.narrative-slider', that.$el).animate({'margin-left': -(movementSize*stage)}, 400, 'easeOutBack');
                    }
                }
                
                that.model.set({'stage':stage});

                $('.narrative-widget .narrative-content .item', that.$el).hide();
                $('.narrative-widget .narrative-content .item', that.$el).eq(stage).show();
                $('.narrative-narrative-progress', that.$el).removeClass('selected').eq(stage).addClass('selected');
            });
        },
        changeStage: function() {
            var stage = this.model.get('stage');
            this.evaluateNavigation();

            this.$('.narrative-progress').removeClass('selected').eq(stage).addClass('selected');
            this.$('.narrative-graphic').children('.controls').attr('tabindex', -1);
            this.$('.narrative-graphic').eq(stage).children('.controls').attr('tabindex', 0);
            this.$('.narrative-widget .narrative-content .item').hide();
            this.$('.narrative-widget .narrative-content .item').eq(stage).show();
            this.$('.header .inner .title').hide();
            this.$('.header .inner .title').eq(stage).show();
        },
        evaluateNavigation: function() {
            if (this.model.get('navigate') == false) {
                this.$('.narrative-control-left').hide();
                this.$('.narrative-control-right').hide();
                return;
            }
            var currentStage = this.model.get('stage');
            var itemCount = this.model.get('itemCount');

            if (currentStage == 0) {
                this.$('.narrative-control-left').hide();      
            } 

            if (currentStage == (itemCount - 1)) {
                this.$('.narrative-control-right').hide();      
            }

            if (currentStage != 0 && currentStage < (itemCount - 1)) {
                this.$('.narrative-control-left').show();
                this.$('.narrative-control-right').show(); 
            } 
        },
        evaluateCompletion: function() {
            if (this.$('.visited').length == this.model.get('itemCount')) {
                this.setCompletionStatus();
            }
        },
        openNarrative: function (event) {
            event.preventDefault();
            this.model.set('active', false);

            var outerMargin = parseFloat(this.$('.narrative-popup > .inner').css('margin'));
            var innerPadding = parseFloat(this.$('.narrative-popup > .inner').css('padding'));
            var toolBarHeight = this.$('.narrative-popup > .inner .narrative-toolbar').height();
            
            this.$('.narrative-slider .narrative-graphic').eq(this.model.get('stage')).addClass('visited');
            this.$('.narrative-popup .narrative-toolbar .title').hide();
            this.$('.narrative-popup .narrative-toolbar .title').eq(this.model.get('stage')).show();
            this.$('.narrative-popup .narrative-content').hide();
            this.$('.narrative-popup .narrative-content').eq(this.model.get('stage')).show();
            this.$('.narrative-popup > .inner').css('height', $(window).height() - (outerMargin * 2) - (innerPadding * 2));
            this.$('.narrative-popup').show();
            this.$('.narrative-popup .narrative-content').css('height', (this.$('.narrative-popup > .inner').height() - toolBarHeight));

            this.evaluateCompletion();
        },
        closeNarrative: function (event) {
            event.preventDefault();
            this.model.set('active', true);

            this.$('.narrative-popup-close').blur();
            this.$('.narrative-popup').hide();
        }
    });
    
    Adapt.register("narrative", Narrative);
    
});