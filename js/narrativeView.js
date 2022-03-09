import Adapt from 'core/js/adapt';
import a11y from 'core/js/a11y';
import ComponentView from 'core/js/views/componentView';
import device from 'core/js/device';
import MODE from './modeEnum';

class NarrativeView extends ComponentView {

  events() {
    return {
      'click .js-narrative-strapline-open-popup': 'openPopup',
      'click .js-narrative-controls-click': 'onNavigationClicked',
      'click .js-narrative-progress-click': 'onProgressClicked'
    };
  }

  initialize(...args) {
    super.initialize(...args);

    this._isInitial = true;
  }

  preRender() {
    this.listenTo(Adapt, {
      'device:changed device:resize': this.reRender,
      'notify:closed': this.closeNotify
    });
    this.renderMode();

    this.listenTo(this.model.getChildren(), {
      'change:_isActive': this.onItemsActiveChange,
      'change:_isVisited': this.onItemsVisitedChange
    });

    this.checkIfResetOnRevisit();
    this.calculateWidths();
  }

  onItemsActiveChange(item, _isActive) {
    if (!_isActive) return;
    this.setStage(item);
  }

  onItemsVisitedChange(item, _isVisited) {
    if (!_isVisited) return;
    this.$(`[data-index="${item.get('_index')}"]`).addClass('is-visited');
  }

  calculateMode() {
    const mode = device.screenSize === 'large' ? MODE.LARGE : MODE.SMALL;
    this.model.set('_mode', mode);
  }

  renderMode() {
    this.calculateMode();

    const isLargeMode = this.isLargeMode();
    this.$el.toggleClass('mode-large', isLargeMode).toggleClass('mode-small', !isLargeMode);
  }

  isLargeMode() {
    return this.model.get('_mode') === MODE.LARGE;
  }

  postRender() {
    this.renderMode();
    this.setupNarrative();

    this.$('.narrative__slider').imageready(this.setReadyStatus.bind(this));

    if (Adapt.config.get('_disableAnimation')) {
      this.$el.addClass('disable-animation');
    }
  }

  checkIfResetOnRevisit() {
    const isResetOnRevisit = this.model.get('_isResetOnRevisit');
    // If reset is enabled set defaults
    if (!isResetOnRevisit) return;
    this.model.reset(isResetOnRevisit);
  }

  setupNarrative() {
    this.renderMode();
    const items = this.model.getChildren();
    if (!items || !items.length) return;

    let activeItem = this.model.getActiveItem();
    if (!activeItem) {
      activeItem = this.model.getItem(0);
      activeItem.toggleActive(true);
    } else {
      // manually trigger change as it is not fired on reentry
      items.trigger('change:_isActive', activeItem, true);
    }

    if (!this.isLargeMode() && !this.model.get('_wasHotgraphic')) {
      this.replaceInstructions();
    }
    this.setupEventListeners();
    this._isInitial = false;
  }

  calculateWidths() {
    const itemCount = this.model.getChildren().length;
    // we have calculate IE11 total width. This is because the item width may not add up to exactly 100%
    // because IE truncates off digits after 2 decimal places
    // e.g. if there are 6 items each item will have a width of 16.66%,
    // meaning the total width of the 6 items is 99.96%
    // this fixes an issue on IE11 where you could see the next image slightly
    const itemWidth = 100 / itemCount;
    this.model.set({
      _totalWidth: 100 * itemCount,
      _itemWidth: itemWidth
    });

    if ($('.ie').length > 0) {
      this.model.set({
        _IE11TotalWidth: this.getNumberFloored(this.getNumberFloored(itemWidth) * itemCount),
        _IE11Offset: ((itemWidth).toFixed(2) * itemCount) > 100 ? ((itemWidth).toFixed(2) * itemCount) - 100 : 0
      });
    }
  }

  getNumberFloored(numberToFloor) {
    return Math.floor((numberToFloor) * 100) / 100;
  }

  resizeControl() {
    const previousMode = this.model.get('_mode');
    this.renderMode();
    if (previousMode !== this.model.get('_mode')) this.replaceInstructions();
    this.evaluateNavigation();
    const activeItem = this.model.getActiveItem();
    if (activeItem) this.setStage(activeItem);
  }

  reRender() {
    if (this.model.get('_wasHotgraphic') && this.isLargeMode()) {
      this.replaceWithHotgraphic();
      return;
    }
    this.resizeControl();
  }

  closeNotify() {
    this.evaluateCompletion();
  }

  replaceInstructions() {
    if (this.isLargeMode()) {
      this.$('.narrative__instruction-inner').html(this.model.get('instruction'));
      return;
    }

    if (this.model.get('mobileInstruction') && !this.model.get('_wasHotgraphic')) {
      this.$('.narrative__instruction-inner').html(this.model.get('mobileInstruction'));
    }
  }

  replaceWithHotgraphic() {
    const HotgraphicView = Adapt.getViewClass('hotgraphic');
    if (!HotgraphicView) return;

    const model = this.prepareHotgraphicModel();
    const newHotgraphic = new HotgraphicView({ model });

    this.$el.parents('.component__container').append(newHotgraphic.$el);
    this.remove();
    _.defer(() => {
      Adapt.trigger('device:resize');
    });
  }

  prepareHotgraphicModel() {
    const model = this.model;
    model.resetActiveItems();
    model.set({
      _isPopupOpen: false,
      _component: 'hotgraphic',
      body: model.get('originalBody'),
      instruction: model.get('originalInstruction')
    });

    return model;
  }

  moveSliderToIndex(itemIndex) {
    let offset;

    // get the exact width of all of the items for IE11
    // and do a calculation to work out the offset for transforming the image
    if (this.model.get('_IE11TotalWidth')) {
      offset = parseFloat((parseFloat(Math.floor(this.model.get('_itemWidth') * 100) / 100) *
        itemIndex - (100 - this.model.get('_IE11TotalWidth')) +
        this.model.get('_IE11Offset')).toFixed(2));

    } else {
      offset = (this.model.get('_itemWidth') * itemIndex);
    }

    if (Adapt.config.get('_defaultDirection') === 'ltr') {
      offset *= -1;
    }

    const cssValue = `translateX(${offset}%)`;
    const $sliderElm = this.$('.narrative__slider');
    const $straplineHeaderElm = this.$('.narrative__strapline-header-inner');

    $sliderElm.css('transform', cssValue);
    $straplineHeaderElm.css('transform', cssValue);

    if (this._isInitial) return;

    const $elementToFocus = this.isLargeMode() ? this.$(`.narrative__content-item[data-index="${itemIndex}"]`) : this.$('.narrative__strapline-btn');
    a11y.focusFirst($elementToFocus);
  }

  setStage(item) {
    const index = item.get('_index');
    const indexSelector = `[data-index="${index}"]`;

    if (this.isLargeMode()) {
      // Set the visited attribute for large screen devices
      item.toggleVisited(true);
    }

    this.$('.narrative__progress').removeClass('is-selected').filter(indexSelector).addClass('is-selected');

    const $slideGraphics = this.$('.narrative__slider-image-container');
    a11y.toggleAccessibleEnabled($slideGraphics.children('.controls'), false);
    a11y.toggleAccessibleEnabled($slideGraphics.filter(indexSelector).children('.controls'), true);

    const $narrativeItems = this.$('.narrative__content-item');
    $narrativeItems.addClass('u-visibility-hidden u-display-none');
    a11y.toggleAccessible($narrativeItems, false);
    a11y.toggleAccessible($narrativeItems.filter(indexSelector).removeClass('u-visibility-hidden u-display-none'), true);

    const $narrativeStraplineButtons = this.$('.narrative__strapline-btn');
    a11y.toggleAccessibleEnabled($narrativeStraplineButtons, false);
    a11y.toggleAccessibleEnabled($narrativeStraplineButtons.filter(indexSelector), true);

    this.evaluateNavigation();
    this.evaluateCompletion();
    this.moveSliderToIndex(index);
  }

  evaluateNavigation() {
    const active = this.model.getActiveItem();
    if (!active) return;

    const index = active.get('_index');
    const itemCount = this.model.getChildren().length;

    const isAtStart = index === 0;
    const isAtEnd = index === itemCount - 1;

    const $left = this.$('.narrative__controls-left');
    const $right = this.$('.narrative__controls-right');

    const globals = Adapt.course.get('_globals');

    const ariaLabelsGlobals = globals._accessibility._ariaLabels;
    const narrativeGlobals = globals._components._narrative;

    const ariaLabelPrevious = narrativeGlobals.previous || ariaLabelsGlobals.previous;
    const ariaLabelNext = narrativeGlobals.next || ariaLabelsGlobals.next;

    const prevTitle = isAtStart ? '' : this.model.getItem(index - 1).get('title');
    const nextTitle = isAtEnd ? '' : this.model.getItem(index + 1).get('title');

    $left.toggleClass('u-visibility-hidden', isAtStart);
    $right.toggleClass('u-visibility-hidden', isAtEnd);

    $left.attr('aria-label', Handlebars.compile(ariaLabelPrevious)({
      title: prevTitle,
      _globals: globals,
      itemNumber: isAtStart ? null : index,
      totalItems: itemCount
    }));
    $right.attr('aria-label', Handlebars.compile(ariaLabelNext)({
      title: nextTitle,
      _globals: globals,
      itemNumber: isAtEnd ? null : index + 2,
      totalItems: itemCount
    }));
  }

  evaluateCompletion() {
    if (!this.model.areAllItemsCompleted()) return;
    this.trigger('allItems');
  }

  openPopup() {
    const currentItem = this.model.getActiveItem();
    Adapt.notify.popup({
      title: currentItem.get('title'),
      body: currentItem.get('body')
    });

    Adapt.on('popup:opened', function() {
      // Set the visited attribute for small and medium screen devices
      currentItem.toggleVisited(true);
    });
  }

  onNavigationClicked(event) {
    const $btn = $(event.currentTarget);
    let index = this.model.getActiveItem().get('_index');
    $btn.data('direction') === 'right' ? index++ : index--;
    this.model.setActiveItem(index);
  }

  onProgressClicked(event) {
    const index = $(event.target).data('index');
    this.model.setActiveItem(index);
  }

  setupEventListeners() {
    if (this.model.get('_setCompletionOn') !== 'inview') return;
    this.setupInviewCompletion('.component__widget');
  }

}

NarrativeView.template = 'narrative';

export default NarrativeView;
