define(function(require) {

	var ComponentView = require("coreViews/componentView");
	var Adapt = require("coreJS/adapt");

    var Narrative = ComponentView.extend({
        
        postRender: function() {
            this.setReadyStatus();
            this.setCompletionStatus();
        },        
        init: function () {
            this.$el.addClass('clearfix');
            this.listenTo(Adapt, 'pageView:ready', this.setupNarrative, this);
            this.listenTo(Adapt, 'device:change', this.reRender, this);
            this.listenTo(Adapt, 'device:resize', this.resizeControl, this);
            // this.$el.hide();
        },
        events: function () {
            return Adapt.device.touch == true ? {
                'touchstart .slider':'navigateTouch',
                'touchstart .strapline .open':'openNarrative',
                'click .toolbar .close':'closeNarrative'
                }:{
                'click .controls':'navigateClick',
                'click .strapline .open':'openNarrative',
                'click .toolbar .close':'closeNarrative'
            }
        },
        setupNarrative: function() {
            // Todo move this?
            if (!Adapt.device.touch) {
                this.model.set('navigate', true);
                this.$el.addClass('desktop');
            } else {
                this.model.set('navigate', false);
                this.$el.addClass('mobile');
            }            

            var slideCount = $('.graphic', this.$el).length;
            var isSmallScreen = (Adapt.device.screenSize == 'small') ? true : false;
            this.model.set('itemCount', slideCount);
            this.calculateWidths();

            $('.widget .slide .indicators .button', this.$el).first().addClass('selected');        
            $('.widget .slide').css('overflow-x', 'hidden');
            $('.widget .graphic', this.$el).first().addClass('visited');       
            $('.widget .content .item', this.$el).hide().first().show(); 

            this.model.set('stage', 0);
            this.model.set('active', true);

            this.toggleStrapline(isSmallScreen);

            this.evaluateNavigation();
            this.evaluateCompletion();

            // OK to show the slider widget at this point?
            // this.$el.show();
        },
        toggleStrapline: function(show) {
            var stage = this.model.get('stage');

            if (show) {
                $('.strapline', this.$el).show();
                $('.header .inner .title').hide();
                $('.header .inner .title').eq(stage).show();
                $('.content').hide();
                $('.slider')
            }
            else {
                $('.strapline', this.$el).hide();
                $('.content').show();
            }
        },
        calculateWidths: function() {
            if (this.model.get('mobile')) {
                $('.slide', this.$el).width('100%');
            } else {
                $('.slide', this.$el).width('60%');
            }

            var slideWidth = $('.slide', this.$el).width();
            var slideCount = this.model.get('itemCount');
            var extraMargin = parseInt($('.graphic', this.$el).css('margin-right'));

            $('.slider .graphic', this.$el).width(slideWidth)
            $('.slider', this.$el).width((slideWidth+extraMargin)*slideCount);

            // Get the current stage
            var stage = this.model.get('stage');
            var margin = (stage  * slideWidth) * -1;

            $('.slider', this.$el).css('margin-left', margin);
        },
        resizeControl: function() {
            // console.log('resizing...');
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
        setReadyStatus: function() {
            this.$('.slider').imageready(_.bind(function(){
                this.model.set('_isReady', true);
            }, this));
        },
        navigateClick: function (event) {
            event.preventDefault();
            if (!this.model.get('active')) return;

            var extraMargin = parseInt($('.graphic', this.$el).css('margin-right'));
            var movementSize = $('.slide', this.$el).width()+extraMargin;
            var strapLineSize = $('.strapline .title', this.$el).width();
            var stage = this.model.get('stage');
            var itemCount = this.model.get('itemCount');

            if ($(event.currentTarget).hasClass('right')) {
                if (stage < itemCount - 1) {
                    stage ++;
                    $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
                    if (!this.model.get('mobile')) {
                        $('.widget .graphic', this.$el).eq(stage).addClass('visited');
                        this.evaluateCompletion();
                    }
                } 
                else {
                    return;
                }
            }
            if ($(event.currentTarget).hasClass('left')) {
                if (stage > 0) {
                    stage --;
                    $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
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
                startPos = parseInt($('.slider', this.$el).css('margin-left')),
                xPos = event.originalEvent.touches[0]['pageX'],
                stage = this.model.get('stage'),
                extraMargin = parseInt($('.graphic', this.$el).css('margin-right')),
                movementSize = $('.slide', this.$el).width()+extraMargin,
                narrativeSize = this.model.get('itemCount'),
                strapLineSize = $('.strapline .title', this.$el).width(),
                move;
                // console.log('xOrigPos = ' + xOrigPos);

            var onFirst = (stage == 0) ? true : false;
            var onLast = (stage == narrativeSize - 1) ? true : false;

            $('.slider', this.$el).on('touchmove', function (event) {
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
                    if (stage < narrativeSize-1) {
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
                // console.log('xPos = ' + xPos);
                $('.slider', that.$el).css('margin-left', move);
            });
            $('.slider', this.$el).one('touchend', function (event) {
                $('.slider', that.$el).unbind('touchmove');
                if (xPos < xOrigPos) {
                    if (stage < narrativeSize-1) {
                        stage ++;
                        $('.slider', that.$el).animate({'margin-left': -(movementSize*stage)});
                        $('.strapline .header > .inner', that.$el).animate({'margin-left': -(strapLineSize*stage)});
                    } else {
                        $('.slider', that.$el).animate({'margin-left': -(movementSize*stage)},400,'easeOutBack');
                    }
                }
                if (xPos > xOrigPos) {
                    if (stage > 0) {
                        stage --;
                        $('.slider', that.$el).animate({'margin-left': -(movementSize*stage)});
                        $('.strapline .header > .inner', that.$el).animate({'margin-left': -(strapLineSize*stage)});
                    } else {
                        $('.slider', that.$el).animate({'margin-left': -(movementSize*stage)},400,'easeOutBack');
                    }
                }
                 that.model.set({'stage':stage});
                $('.widget .content .item', that.$el).hide();
                $('.widget .content .item', that.$el).eq(stage).show();
                $('.progress', that.$el).removeClass('selected').eq(stage).addClass('selected');
            });
        },
        changeStage: function() {
            var stage = this.model.get('stage');
            this.evaluateNavigation();

            $('.progress', this.$el).removeClass('selected').eq(stage).addClass('selected');
            $('.graphic', this.$el).children('.controls').attr('tabindex',-1);
            $('.graphic', this.$el).eq(stage).children('.controls').attr('tabindex',0);
            $('.widget .content .item', this.$el).hide();
            $('.widget .content .item', this.$el).eq(stage).show();
            $('.header .inner .title', this.$el).hide();
            $('.header .inner .title', this.$el).eq(stage).show();
        },
        evaluateNavigation: function() {
            if (this.model.get('navigate') == false) {
                $('.left', this.$el).hide();
                $('.right', this.$el).hide();
                return;
            }
            var currentStage = this.model.get('stage');
            var itemCount = this.model.get('itemCount');

            if (currentStage == 0) {
                $('.left', this.$el).hide();      
            } 

            if (currentStage == (itemCount - 1)) {
                $('.right', this.$el).hide();      
            }

            if (currentStage != 0 && currentStage < (itemCount - 1)) {
                $('.left', this.$el).show();
                $('.right', this.$el).show(); 
            } 
        },
        evaluateCompletion: function() {
            if ($('.visited', this.$el).length == this.model.get('itemCount')) {
                // console.log('all done');
                this.model.set('complete', true);
            }
        },
        openNarrative: function (event) {
            event.preventDefault();
            this.model.set('active',false);
            var outerMargin = parseFloat($('.popup > .inner',this.$el).css('margin')),
                innerPadding = parseFloat($('.popup > .inner',this.$el).css('padding')),
                toolBarHeight = this.$('.popup > .inner .toolbar').height();
            this.$('.slider .graphic').eq(this.model.get('stage')).addClass('visited');
            this.$('.popup .toolbar .title').hide();
            this.$('.popup .toolbar .title').eq(this.model.get('stage')).show();
            this.$('.popup .content').hide();
            this.$('.popup .content').eq(this.model.get('stage')).show();
            $('.popup > .inner',this.$el).css('height', $(window).height()-(outerMargin*2)-(innerPadding*2));
            this.$('.popup').show();
            this.$('.popup .content').css('height', (this.$('.popup > .inner').height()-toolBarHeight))
            this.evaluateCompletion();
        },
        closeNarrative: function (event) {
            event.preventDefault();
            $('.popup .toolbar .close').blur();
            $('.popup', this.$el).hide();
            this.model.set('active', true);
        }
    });
    
    Adapt.register("narrative", Narrative);
    
});