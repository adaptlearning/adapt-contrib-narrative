define([
  'core/js/adapt',
  'core/js/views/componentView',
  './modeEnum'
], function(Adapt, ComponentView, MODE) {
  'use strict';

  var NarrativeView = ComponentView.extend({

    _isInitial: true,

    events: {
      'click .narrative-strapline-title': 'openPopup',
      'click .narrative-controls': 'onNavigationClicked',
      'click .narrative-indicators .narrative-progress': 'onProgressClicked'
    },

    preRender: function() {
      this.listenTo(Adapt, {
        'device:changed device:resize': this.reRender,
        'notify:closed': this.closeNotify
      });
      this.renderMode();

      this.listenTo(this.model.get('_children'), {
        'change:_isActive': this.onItemsActiveChange,
        'change:_isVisited': this.onItemsVisitedChange
      });

      this.checkIfResetOnRevisit();
      this.calculateWidths();
    },

    onItemsActiveChange: function(item, _isActive) {
      if (_isActive === true) {
        this.setStage(item);
      }
    },

    onItemsVisitedChange: function(item, isVisited) {
      if (!isVisited) return;
      this.$('[data-index="' + item.get('_index') + '"]').addClass('visited');
    },

    calculateMode: function() {
      var mode = Adapt.device.screenSize === 'large' ?
        MODE.LARGE :
        MODE.SMALL;
      this.model.set('_mode', mode);
    },

    renderMode: function() {
      this.calculateMode();
      if (this.isLargeMode()) {
        this.$el.addClass('mode-large').removeClass('mode-small');
      } else {
        this.$el.addClass('mode-small').removeClass('mode-large');
      }
    },

    isLargeMode: function() {
      return this.model.get('_mode') === MODE.LARGE;
    },

    postRender: function() {
      this.renderMode();
      this.$('.narrative-slider').imageready(this.setReadyStatus.bind(this));
      this.setupNarrative();

      if (Adapt.config.get('_disableAnimation')) {
        this.$el.addClass('disable-animation');
      }
    },

    checkIfResetOnRevisit: function() {
      var isResetOnRevisit = this.model.get('_isResetOnRevisit');
      // If reset is enabled set defaults
      if (isResetOnRevisit) {
        this.model.reset(isResetOnRevisit);
      }
    },

    setupNarrative: function() {
      this.renderMode();
      var items = this.model.get('_children');
      if (!items || !items.length) return;

      var activeItem = this.model.getActiveItem();
      if (!activeItem) {
        activeItem = this.model.getItem(0);
        activeItem.toggleActive(true);
      } else {
        // manually trigger change as it is not fired on reentry
        items.trigger('change:_isActive', activeItem, true);
      }

      this.calculateWidths();

      if (!this.isLargeMode() && !this.model.get('_wasHotgraphic')) {
        this.replaceInstructions();
      }
      this.setupEventListeners();
      this._isInitial = false;
    },

    calculateWidths: function() {
      var itemCount = this.model.get('_children').length;
      this.model.set({
        '_totalWidth': 100 * itemCount,
        '_itemWidth': 100 / itemCount
      });
    },

    resizeControl: function() {
      var previousMode = this.model.get('_mode');
      this.renderMode();
      if (previousMode !== this.model.get('_mode')) this.replaceInstructions();
      this.evaluateNavigation();
      var activeItem = this.model.getActiveItem();
      if (activeItem) this.setStage(activeItem);
    },

    reRender: function() {
      if (this.model.get('_wasHotgraphic') && this.isLargeMode()) {
        this.replaceWithHotgraphic();
      } else {
        this.resizeControl();
      }
    },

    closeNotify: function() {
      this.evaluateCompletion();
    },

    replaceInstructions: function() {
      if (this.isLargeMode()) {
        this.$('.narrative-instruction-inner').html(this.model.get('instruction'));
      } else if (this.model.get('mobileInstruction') && !this.model.get('_wasHotgraphic')) {
        this.$('.narrative-instruction-inner').html(this.model.get('mobileInstruction'));
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

    moveSliderToIndex: function(itemIndex) {
      var offset = this.model.get('_itemWidth') * itemIndex;
      if (Adapt.config.get('_defaultDirection') === 'ltr') {
        offset *= -1;
      }
      var cssValue = 'translateX('+offset+'%)';
      var $sliderElm = this.$('.narrative-slider');
      var $straplineHeaderElm = this.$('.narrative-strapline-header-inner');

      $sliderElm.css('transform', cssValue);
      $straplineHeaderElm.css('transform', cssValue);

      if (Adapt.config.get('_disableAnimation') || this._isInitial) {
        this.onTransitionEnd();
      } else {
        $sliderElm.one('transitionend', this.onTransitionEnd.bind(this));
      }
    },

    onTransitionEnd: function() {
      if (this._isInitial) return;

      var index = this.model.getActiveItem().get('_index');
      if (this.isLargeMode()) {
        this.$('.narrative-content-item[data-index="'+index+'"]').a11y_focus();
      } else {
        this.$('.narrative-strapline-title').a11y_focus();
      }
    },

    setStage: function(item) {
      var index = item.get('_index');
      if (this.isLargeMode()) {
        // Set the visited attribute for large screen devices
        item.toggleVisited(true);
      }

      var $slideGraphics = this.$('.narrative-slider-graphic');
      this.$('.narrative-progress:visible').removeClass('selected').filter('[data-index="'+index+'"]').addClass('selected');
      $slideGraphics.children('.controls').a11y_cntrl_enabled(false);
      $slideGraphics.filter('[data-index="'+index+'"]').children('.controls').a11y_cntrl_enabled(true);
      this.$('.narrative-content-item').addClass('narrative-hidden').a11y_on(false).filter('[data-index="'+index+'"]').removeClass('narrative-hidden').a11y_on(true);
      this.$('.narrative-strapline-title').a11y_cntrl_enabled(false).filter('[data-index="'+index+'"]').a11y_cntrl_enabled(true);

      this.evaluateNavigation();
      this.evaluateCompletion();
      this.moveSliderToIndex(index);
    },

    evaluateNavigation: function() {
      var active = this.model.getActiveItem();
      if (!active) return;

      var currentStage = active.get('_index');
      var itemCount = this.model.get('_children').length;

      var isAtStart = currentStage === 0;
      var isAtEnd = currentStage === itemCount - 1;

      this.$('.narrative-control-left').toggleClass('narrative-hidden', isAtStart);
      this.$('.narrative-control-right').toggleClass('narrative-hidden', isAtEnd);
    },

    evaluateCompletion: function() {
      if (this.model.areAllItemsCompleted()) {
        this.trigger('allItems');
      }
    },

    openPopup: function(event) {
      event && event.preventDefault();

      var currentItem = this.model.getActiveItem();
      Adapt.trigger('notify:popup', {
        title: currentItem.get('title'),
        body: currentItem.get('body')
      });

      Adapt.on('popup:opened', function() {
        // Set the visited attribute for small and medium screen devices
        currentItem.toggleVisited(true);
      });
    },

    onNavigationClicked: function(event) {
      var stage = this.model.getActiveItem().get('_index');

      if ($(event.currentTarget).hasClass('narrative-control-right')) {
        this.model.setActiveItem(++stage);
      } else if ($(event.currentTarget).hasClass('narrative-control-left')) {
        this.model.setActiveItem(--stage);
      }
    },

    onProgressClicked: function(event) {
      event && event.preventDefault();
      var clickedIndex = $(event.target).data('index');
      this.model.setActiveItem(clickedIndex);
    },

    setupEventListeners: function() {
      if (this.model.get('_setCompletionOn') === 'inview') {
        this.setupInviewCompletion('.component-widget');
      }
    }

  });

  return NarrativeView;

});
