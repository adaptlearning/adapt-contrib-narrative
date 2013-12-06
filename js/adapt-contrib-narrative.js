define(function(require) {

	var ComponentView = require("coreViews/componentView");
	var Adapt = require("coreJS/adapt");

    var Narrative = ComponentView.extend({
        
        postRender: function() {
            this.setReadyStatus();
            this.setCompletionStatus();
        },        
        init: function () {
            // this.$el.addClass('clearfix');
            // this.listenTo(Adapt.Manager.model, 'change:screenSize', this.setupLayout, this);
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
            this.model.set('itemCount', slideCount);
            this.calculateWidths();

            $('.widget .slide .indicators .button', this.$el).first().addClass('selected');        
            $('.widget .slide').css('overflow-x', 'hidden');
            $('.widget .graphic', this.$el).first().addClass('visited');       
            $('.widget .content .item', this.$el).hide().first().show(); 

            this.model.set('stage', 0);
            this.model.set('active', true);

            this.toggleStrapline(this.$el.hasClass('mobile'));

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
            console.log('resizing...');
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
            if (this.model.get('component')=='hotgraphic' && (Adapt.device.screenSize != 'small')) {
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
    
        
        onScreenSizeChanged: function () {
            console.log('onScreenSizeChanged')
            if ($(window).width() > 799) this.$el.addClass('desktop')
            else this.$el.addClass('mobile');
            this.$el.addClass('desktop');
            
            var slideWidth = this.$('.slide').width(),
                graphicLength = this.$('.graphic').length,
                extraMargin = parseInt(this.$('.graphic').css('margin-right'));
            this.model.set('stage',0);
            this.$('.widget .content .item').hide().first().show();
            this.$('.slider').css('margin-left',0);
            this.$('.strapline .header > .inner').css('margin-left',0);
            if (!Adapt.device.touch) {
               this.model.set('navigate',true);
           }
            this.model.set('active', true);
            this.$('.slider .graphic').width(slideWidth)
            this.$('.slider').width((slideWidth+extraMargin)*graphicLength);
            $('.progress',this.$el).removeClass('selected').first().addClass('selected');
            this.$('.header').width(slideWidth-this.$('.strapline .controls').width());
            this.$('.header .title').width(this.$('.header').width());
            this.$('.header > .inner').width(this.$('.header .title').width()*this.$('.header .title').length);
            this.$('.graphic').first().children('.controls').attr('tabindex',0);
            if ($(window).width() > 699) {
                $(this.el).removeClass('mobile').addClass('desktop');
                this.$('.widget .graphic').first().addClass('visited');
            } else {
                $(this.el).removeClass('desktop').addClass('mobile');
            }
            return this;
        },
    
        // navigateClick: function (event) {
        //     event.preventDefault();
        //     if (!this.model.get('active')) return;

        //     var extraMargin = parseInt($('.graphic', this.$el).css('margin-right')),
        //         movementSize = $('.slide', this.$el).width()+extraMargin,
        //         narrativeSize = $('.graphic', this.$el).length,
        //         strapLineSize = $('.strapline .title', this.$el).width(),
        //         stage = this.model.get('stage');
        //     if ($(event.currentTarget).hasClass('right')) {
        //         if (stage < narrativeSize-1) {
        //             stage ++;
        //             $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
        //             $('.strapline .header > .inner', this.$el).stop(true, true).delay(400).animate({'margin-left': -(strapLineSize*stage)});
        //             if (!this.model.get('mobile')) {
        //                 $('.widget .graphic', this.$el).eq(stage).addClass('visited');
        //                 if ($('.visited', this.$el).length == $('.slider .graphic', this.$el).length) {
        //                     this.model.set('complete', true);
        //                 }
        //             }
        //         } else {
        //             stage = 0;
        //             $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
        //             $('.strapline .header > .inner', this.$el).delay(400).animate({'margin-left': -(strapLineSize*stage)});
        //         }
        //     }
        //     if ($(event.currentTarget).hasClass('left')) {
        //         if (stage > 0) {
        //             stage --;
        //             $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
        //             $('.strapline .header > .inner', this.$el).stop(true, true).delay(400).animate({'margin-left': -(strapLineSize*stage)});
        //         }
        //     }
        //     this.model.set('stage', stage);
        //     $('.progress', this.$el).removeClass('selected').eq(stage).addClass('selected');
        //     $('.graphic', this.$el).children('.controls').attr('tabindex',-1);
        //     $('.graphic', this.$el).eq(stage).children('.controls').attr('tabindex',0);
        //     $('.widget .content .item', this.$el).hide();
        //     $('.widget .content .item', this.$el).eq(stage).show()
        // },
          navigateClick: function (event) {
            event.preventDefault();
            if (!this.model.get('active')) return;

            var extraMargin = parseInt($('.graphic', this.$el).css('margin-right')),
                movementSize = $('.slide', this.$el).width()+extraMargin,
                narrativeSize = $('.graphic', this.$el).length,
                strapLineSize = $('.strapline .title', this.$el).width(),
                stage = this.model.get('stage');

            var stage = this.model.get('stage');
            var itemCount = this.model.get('itemCount');

            if ($(event.currentTarget).hasClass('right')) {
                if (stage < itemCount - 1) {
                    stage ++;
                    $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
                   // $('.strapline .header > .inner', this.$el).stop(true, true).delay(400).animate({'margin-left': -(strapLineSize*stage)});
                    if (!this.model.get('mobile')) {
                        $('.widget .graphic', this.$el).eq(stage).addClass('visited');
                        this.evaluateCompletion();
                    }
                } 
                else {
                    // this.evaluateNavigation();
                    return;
                    // stage = 0;
                    // $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
                    // $('.strapline .header > .inner', this.$el).delay(400).animate({'margin-left': -(strapLineSize*stage)});
                }
            }
            if ($(event.currentTarget).hasClass('left')) {
                if (stage > 0) {
                    stage --;
                    $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
                   // $('.strapline .header > .inner', this.$el).stop(true, true).delay(400).animate({'margin-left': -(strapLineSize*stage)});
                }
            }
            this.model.set('stage', stage);

            this.changeStage();
            // $('.widget .slider .graphic', this.$el).eq(stage).show();
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
                console.log('all done');
                this.model.set('complete', true);
            }
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
                narrativeSize = $('.graphic', this.$el).length,
                strapLineSize = $('.strapline .title', this.$el).width(),
                move;
            $('.slider', this.$el).on('touchmove', function (event) {
                event.preventDefault();
                xPos = event.originalEvent.touches[0]['pageX'];
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
            //$('.popup .toolbar .close').focus();
            if (this.$('.visited').length == this.$('.slider .graphic').length) {
                this.model.set('complete', true);
            }
        },
        closeNarrative: function (event) {
            event.preventDefault();
            var $currentElement = $('.widget', this.$el);
            $('.popup .toolbar .close').blur();
            $('.popup', this.$el).hide();
            this.model.set('active',true);
            $('.slide .controls .left').focus();
        }
    });
    
    Adapt.register("narrative", Narrative);
    
});