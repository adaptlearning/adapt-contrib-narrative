import Adapt from 'core/js/adapt';
import components from 'core/js/components';
import a11y from 'core/js/a11y';
import device from 'core/js/device';
import notify from 'core/js/notify';
import ComponentView from 'core/js/views/componentView';
import MODE from './modeEnum';

class NarrativeView extends ComponentView {

  events() {
    return {
      'click .js-narrative-strapline-open-popup': 'openPopup',
      'click .js-narrative-controls-click': 'onNavigationClicked',
      'click .js-narrative-progress-click': 'onProgressClicked',
      'swipeleft .js-narrative-swipe': 'onSwipeLeft',
      'swiperight .js-narrative-swipe': 'onSwipeRight'
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

    this.calculateWidths();
  }

  onItemsActiveChange(item, _isActive) {
    if (!_isActive) return;
    if (this.isTextBelowImage()) {
      item.toggleVisited(true);
    }
    this.setStage(item);
    this.setFocus(item.get('_index'));
  }

  setFocus(itemIndex) {
    if (this._isInitial) return;
    const $straplineHeaderElm = this.$('.narrative__strapline-header-inner');
    const hasStraplineTransition = !this.isLargeMode() && ($straplineHeaderElm.css('transitionDuration') !== '0s');
    if (hasStraplineTransition) {
      $straplineHeaderElm.one('transitionend', () => {
        this.focusOnNarrativeElement(itemIndex);
      });
      return;
    }

    this.focusOnNarrativeElement(itemIndex);
  }

  focusOnNarrativeElement(itemIndex) {
    const dataIndexAttr = `[data-index='${itemIndex}']`;
    const $elementToFocus = this.isLargeMode() ?
      this.$(`.narrative__content-item${dataIndexAttr}`) :
      this.$(`.narrative__strapline-btn${dataIndexAttr}`);
    a11y.focusFirst($elementToFocus);
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
    const isTextBelowImage = this.isTextBelowImage();
    this.$el
      .toggleClass('mode-large', isLargeMode)
      .toggleClass('mode-small', !isLargeMode)
      .toggleClass('items-are-full-width', isTextBelowImage);
  }

  isLargeMode() {
    return this.model.get('_mode') === MODE.LARGE;
  }

  isTextBelowImage() {
    const isTextBelowImage = (device.screenSize === 'large')
      ? this.model.get('_isTextBelowImage')
      : this.model.get('_isMobileTextBelowImage');
    return Boolean(isTextBelowImage);
  }

  postRender() {
    this.renderMode();
    this.setupNarrative();

    this.$('.narrative__slider').imageready(this.setReadyStatus.bind(this));

    if (Adapt.config.get('_disableAnimation')) {
      this.$el.addClass('disable-animation');
    }
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

    this.calculateWidths();

    if (!this.isLargeMode() && !this.model.get('_wasHotgraphic')) {
      this.replaceInstructions();
    }
    this.setupEventListeners();
    this._isInitial = false;
  }

  calculateWidths() {
    const itemCount = this.model.getChildren().length;
    this.model.set({
      _totalWidth: 100 * itemCount,
      _itemWidth: 100 / itemCount
    });
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
    const HotgraphicView = components.getViewClass('hotgraphic');
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
    let offset = this.model.get('_itemWidth') * itemIndex;
    if (Adapt.config.get('_defaultDirection') === 'ltr') {
      offset *= -1;
    }
    const cssValue = `translateX(${offset}%)`;
    const $sliderElm = this.$('.narrative__slider');
    const $straplineHeaderElm = this.$('.narrative__strapline-header-inner');

    $sliderElm.css('transform', cssValue);
    $straplineHeaderElm.css('transform', cssValue);
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
    a11y.toggleAccessibleEnabled($slideGraphics, false);
    a11y.toggleAccessibleEnabled($slideGraphics.filter(indexSelector), true);

    const $narrativeItems = this.$('.narrative__content-item');
    $narrativeItems.addClass('u-visibility-hidden u-display-none');
    a11y.toggleAccessible($narrativeItems, false);
    a11y.toggleAccessible($narrativeItems.filter(indexSelector).removeClass('u-visibility-hidden u-display-none'), true);

    const $narrativeStraplineButtons = this.$('.narrative__strapline-btn');
    a11y.toggleAccessibleEnabled($narrativeStraplineButtons, false);
    a11y.toggleAccessibleEnabled($narrativeStraplineButtons.filter(indexSelector), true);

    this.evaluateNavigation();
    this.evaluateCompletion();
    this.shouldShowInstructionError();
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

    $left.attr('aria-label', Handlebars.helpers.compile_a11y_normalize(ariaLabelPrevious, {
      title: prevTitle,
      _globals: globals,
      itemNumber: isAtStart ? null : index,
      totalItems: itemCount
    }));
    $right.attr('aria-label', Handlebars.helpers.compile_a11y_normalize(ariaLabelNext, {
      title: nextTitle,
      _globals: globals,
      itemNumber: isAtEnd ? null : index + 2,
      totalItems: itemCount
    }));
  }

  evaluateCompletion() {
    if (this.model.areAllItemsCompleted()) {
      this.trigger('allItems');
      this.$('.narrative__instruction-inner').removeClass('instruction-error');
    }
  }

  openPopup() {
    const currentItem = this.model.getActiveItem();
    notify.popup({
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

  onSwipeLeft() {
    let index = this.model.getActiveItem().get('_index');
    this.model.setActiveItem(++index);
  }

  onSwipeRight() {
    let index = this.model.getActiveItem().get('_index');
    this.model.setActiveItem(--index);
  }

  onProgressClicked(event) {
    const index = $(event.target).data('index');
    this.model.setActiveItem(index);
  }

  /**
   * In mobile view, highlight instruction if user navigates to another
   * item before completing, in case the strapline is missed
   */
  shouldShowInstructionError() {
    const prevItemIndex = this.model.getActiveItem().get('_index') - 1;
    if (prevItemIndex < 0 || this.model.getItem(prevItemIndex).get('_isVisited')) return;
    this.$('.narrative__instruction-inner').addClass('instruction-error');
  }

  setupEventListeners() {
    if (this.model.get('_setCompletionOn') === 'inview') {
      this.setupInviewCompletion('.component__widget');
    }
  }
}

NarrativeView.template = 'narrative';

export default NarrativeView;
