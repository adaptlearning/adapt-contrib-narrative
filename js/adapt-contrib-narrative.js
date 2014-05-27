/*
* adapt-contrib-narrative
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Brian Quinn <brian@learningpool.com>, Daryl Heldey <darylhedley@hotmail.com>
*/
define(function(require) {

    var ComponentView = require("coreViews/componentView");
    var Adapt = require("coreJS/adapt");

    var Narrative = ComponentView.extend({
 
        events: {
            'touchstart .narrative-slider':'onTouchNavigationStarted',
            'click .narrative-popup-open':'openPopup',
            'click .notify-popup-icon-close':'closePopup',
            'click .narrative-controls':'onNavigationClicked'
        },
        
        preRender: function () {
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
            this.setupNarrative();
        }, 

        setupNarrative: function() {
            _.bindAll(this, 'onTouchMove', 'onTouchEnd');
            this.setDeviceSize();
            this.model.set('_itemCount', this.model.get('_items').length);

            this.model.set('_active', true);

            if (this.model.get('_stage')) {
                this.setStage(this.model.get('_stage'));
            } else {
                this.setStage(0);
            }
            this.calculateWidths();
        },

        calculateWidths: function() {
            var slideWidth = this.$('.narrative-slide-container').width();
            var slideCount = this.model.get('_itemCount');
            var marginRight = this.$('.narrative-slider-graphic').css('margin-right');
            var extraMargin = marginRight === "" ? 0 : parseInt(marginRight);
            var fullSlideWidth = (slideWidth + extraMargin) * slideCount;
            var iconWidth = this.$('.narrative-popup-open').outerWidth();

            this.$('.narrative-slider-graphic').width(slideWidth)
            this.$('.narrative-strapline-header').width(slideWidth);
            this.$('.narrative-strapline-title').width(slideWidth);
            this.$('.narrative-strapline-title-inner').width(slideWidth - iconWidth);

            this.$('.narrative-slider').width(fullSlideWidth);
            this.$('.narrative-strapline-header-inner').width(fullSlideWidth);

            var stage = this.model.get('_stage');
            var margin = -(stage * slideWidth);

            this.$('.narrative-slider').css('margin-left', margin);
            this.$('.narrative-strapline-header-inner').css('margin-left', margin);

            this.model.set('_finalItemLeft', fullSlideWidth - slideWidth);
        },

        resizeControl: function() {
            this.setDeviceSize();
            this.calculateWidths();
            this.evaluateNavigation();
        },

        reRender: function() {
            if (this.model.get('_wasHotgraphic') && Adapt.device.screenSize == 'large') {
                this.replaceWithHotgraphic();
            }
        },

        replaceWithHotgraphic: function () {
            var Hotgraphic = require('components/adapt-contrib-hotgraphic/js/adapt-contrib-hotgraphic');
            var model = this.prepareHotgraphicModel();
            var newHotgraphic = new Hotgraphic({model:model, $parent: this.options.$parent});
            this.options.$parent.append(newHotgraphic.$el);
            this.remove();
            _.defer(function(){
                Adapt.trigger('device:resize');
            });
        },

        prepareHotgraphicModel: function() {
          var model = this.model;
          model.set('_component', 'hotgraphic');
          model.set('body', model.get('originalBody'));
          return model;
        },

        animateSliderToIndex: function(itemIndex) {
            var extraMargin = parseInt(this.$('.narrative-slider-graphic').css('margin-right')),
                movementSize = this.$('.narrative-slide-container').width()+extraMargin;
            
            this.$('.narrative-slider').stop().animate({'margin-left': -(movementSize * itemIndex)});
            this.$('.narrative-strapline-header-inner').stop(true, true).animate({'margin-left': -(movementSize * itemIndex)});
        },

        closePopup: function (event) {
            event.preventDefault();
            Adapt.trigger('popup:closed');
            /*this.model.set('_active', true);

            this.$('.narrative-popup-close').blur();
            this.$('.narrative-popup').addClass('narrative-hidden');
            
            this.evaluateCompletion();*/
        },


        setStage: function(stage) {
            this.model.set('_stage', stage);

            // Set the visited attribute
            var currentItem = this.getCurrentItem(stage);
            currentItem.visited = true;

            this.$('.narrative-progress').removeClass('selected').eq(stage).addClass('selected');
            this.$('.narrative-slider-graphic').children('.controls').attr('tabindex', -1);
            this.$('.narrative-slider-graphic').eq(stage).children('.controls').attr('tabindex', 0);
            this.$('.narrative-content-item').addClass('narrative-hidden').eq(stage).removeClass('narrative-hidden');

            this.evaluateNavigation();
            this.evaluateCompletion();

            this.animateSliderToIndex(stage);
        },

        
        constrainStage: function(stage) {
            if (stage > this.model.get('_items').length - 1) {
                stage = this.model.get('_items').length - 1;
            } else if (stage < 0) {
                stage = 0;
            }
            return stage;
        },
        
        constrainXPosition: function(previousLeft, newLeft, deltaX) {
            if (newLeft > 0 && deltaX > 0) {
                newLeft = previousLeft + (deltaX / (newLeft * 0.1));
            }
            var finalItemLeft = this.model.get('_finalItemLeft'); 
            if (newLeft < -finalItemLeft && deltaX < 0) {
                var distance = Math.abs(newLeft + finalItemLeft);
                newLeft = previousLeft + (deltaX / (distance * 0.1));
            }
            return newLeft;
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

        getNearestItemIndex: function() {
            var currentPosition = parseInt(this.$('.narrative-slider').css('margin-left')),
                graphicWidth = this.$('.narrative-slider-graphic').width(),
                absolutePosition = currentPosition / graphicWidth,
                stage = this.model.get('_stage'),
                relativePosition = stage - Math.abs(absolutePosition);
            
            if(relativePosition < -0.3) {
                stage++;
            } else if (relativePosition > 0.3) {
                stage--;
            }
            
            return this.constrainStage(stage);
        },

        getCurrentItem: function(index) {
            return this.model.get('_items')[index];
        },
        
        getVisitedItems: function() {
          return _.filter(this.model.get('_items'), function(item) {
            return item.visited;
          });
        },

        evaluateCompletion: function() {
            if (this.getVisitedItems().length == this.model.get('_items').length) {
                this.setCompletionStatus();
            }
        },

        moveElement: function($element, deltaX) {
            var previousLeft = parseInt($element.css('margin-left')),
                newLeft = previousLeft + deltaX;
            
            newLeft = this.constrainXPosition(previousLeft, newLeft, deltaX);

            $element.css('margin-left', newLeft + 'px');
        },
        
        openPopup: function (event) {
            event.preventDefault();
            var currentItem = this.getCurrentItem(this.model.get('_stage')),
                popupObject = {
                    title: currentItem.title,
                    body: currentItem.body
                };

            Adapt.trigger('notify:popup', popupObject);
            Adapt.trigger('popup:opened');
        },

        onNavigationClicked: function(event) {
            event.preventDefault();
            
            if (!this.model.get('_active')) return;
            
            var stage = this.model.get('_stage'),
                numberOfItems = this.model.get('_itemCount');
            
            if ($(event.currentTarget).hasClass('narrative-control-right')) {
                stage++;
            } else if ($(event.currentTarget).hasClass('narrative-control-left')) {
                stage--;
            }
            stage = (stage + numberOfItems) % numberOfItems;
            this.setStage(stage);
        },

        onTouchNavigationStarted: function(event) {
            //event.preventDefault();
            //if (!this.model.get('_active')) return;
            
            /*this.$('.narrative-slider').stop();
            this.$('.narrative-strapline-header-inner').stop();
            
            this.model.set('_currentX', event.originalEvent.touches[0]['pageX']);
            this.model.set('_touchStartPosition', parseInt(this.$('.narrative-slider').css('margin-left')));
            
            this.$('.narrative-slider').on('touchmove', this.onTouchMove);
            this.$('.narrative-slider').one('touchend', this.onTouchEnd);*/
        },

        onTouchEnd: function(event) {
            var nextItemIndex = this.getNearestItemIndex();
            this.setStage(nextItemIndex);
            
            this.$('.narrative-slider').off('touchmove', this.onTouchMove);
        },

        onTouchMove: function(event) {
            var currentX = event.originalEvent.touches[0]['pageX'],
                previousX = this.model.get('_currentX'),
                deltaX = currentX - previousX;
            
            this.moveElement(this.$('.narrative-slider'), deltaX);
            this.moveElement(this.$('.narrative-strapline-header-inner'), deltaX);
            
            this.model.set('_currentX', currentX);
            Adapt.trigger('popup:closed');
        }
        
    });
    
    Adapt.register("narrative", Narrative);
    
    return Narrative;

});