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
            this.listenTo(Adapt, 'device:change', this.reRender, this);
            
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
        reRender: function() {
            if (this.model.get('component')=='hotgraphic' && (Adapt.device.screenSize != 'small')) {
                new Adapt.hotgraphic({model:this.model, $parent:this.$parent}).render();
                this.remove();
            } else {
                this.preRender();
                this.render();
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
            // console.log('ready status')
            this.$('.widget').imageready(_.bind(function(){
                 console.log('in imageready');
                this.setupLayout();
                // this.onScreenSizeChanged();
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
    
        navigateClick: function (event) {
            event.preventDefault();
            if (!this.model.get('active')) return;

            var extraMargin = parseInt($('.graphic', this.$el).css('margin-right')),
                movementSize = $('.slide', this.$el).width()+extraMargin,
                narrativeSize = $('.graphic', this.$el).length,
                strapLineSize = $('.strapline .title', this.$el).width(),
                stage = this.model.get('stage');
            if ($(event.currentTarget).hasClass('right')) {
                if (stage < narrativeSize-1) {
                    stage ++;
                    $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
                    $('.strapline .header > .inner', this.$el).stop(true, true).delay(400).animate({'margin-left': -(strapLineSize*stage)});
                    if (!this.model.get('mobile')) {
                        $('.widget .graphic', this.$el).eq(stage).addClass('visited');
                        if ($('.visited', this.$el).length == $('.slider .graphic', this.$el).length) {
                            this.model.set('complete', true);
                        }
                    }
                } else {
                    stage = 0;
                    $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
                    $('.strapline .header > .inner', this.$el).delay(400).animate({'margin-left': -(strapLineSize*stage)});
                }
            }
            if ($(event.currentTarget).hasClass('left')) {
                if (stage > 0) {
                    stage --;
                    $('.slider', this.$el).stop().animate({'margin-left': -(movementSize*stage)});
                    $('.strapline .header > .inner', this.$el).stop(true, true).delay(400).animate({'margin-left': -(strapLineSize*stage)});
                }
            }
            this.model.set('stage', stage);
            $('.progress', this.$el).removeClass('selected').eq(stage).addClass('selected');
            $('.graphic', this.$el).children('.controls').attr('tabindex',-1);
            $('.graphic', this.$el).eq(stage).children('.controls').attr('tabindex',0);
            $('.widget .content .item', this.$el).hide();
            $('.widget .content .item', this.$el).eq(stage).show()
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
        },
        setupLayout: function () {
            var slideWidth = $('.slide', this.$el).width(),
                graphicLength = $('.graphic', this.$el).length,
                extraMargin = parseInt($('.graphic', this.$el).css('margin-right'));
            
            this.model.set('stage',0);
            
            $('.widget .content .item', this.$el).hide().first().show();
            $('.slider', this.$el).css('margin-left',0);
            $('.strapline .header > .inner', this.$el).css('margin-left',0);
            // if (!Adapt.device.touch) {
                this.model.set('navigate',true);
            // }
            this.model.set('active', true);
            $('.slider .graphic', this.$el).width(slideWidth)
            $('.slider', this.$el).width((slideWidth+extraMargin)*graphicLength);
            $('.progress',this.$el).removeClass('selected').first().addClass('selected');
            $('.header', this.$el).width(slideWidth-$('.strapline .controls', this.$el).width());
            $('.header .title', this.$el).width($('.header', this.$el).width());
            $('.header > .inner', this.$el).width($('.header .title', this.$el).width()*$('.header .title', this.$el).length);
            $('.graphic', this.$el).first().children('.controls').attr('tabindex',0);
            if ($(window).width() > 699) {
                $(this.el).removeClass('mobile').addClass('desktop');
                $('.widget .graphic', this.$el).first().addClass('visited');
            } else {
                $(this.el).removeClass('desktop').addClass('mobile');
            }
            return this;
        },
        /*****************/

        setup:function(){
            var that = this;
            if ($(window).width() > 799) 
                this.$el.addClass('desktop')
            else this.$el.addClass('mobile');
            this.$el.addClass('desktop');
            $('.widget', this.$el).imageready(function(){
                that.setupLayout();
                that.model.set('ready', true);
            })
        },
        
    });
    
    Adapt.register("narrative", Narrative);
    
});