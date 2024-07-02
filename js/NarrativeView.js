import Adapt from 'core/js/adapt';
import a11y from 'core/js/a11y';
import data from 'core/js/data';
import components from 'core/js/components';
import device from 'core/js/device';
import notify from 'core/js/notify';
import ComponentView from 'core/js/views/componentView';
import MODE from './modeEnum';
import { compile } from 'core/js/reactHelpers';

class NarrativeView extends ComponentView {

  events() {
    if (this.model.get('_isStackedOnMobile')) return;

    return {
      'swipeleft .js-narrative-swipe': 'onSwipeLeft',
      'swiperight .js-narrative-swipe': 'onSwipeRight'
    };
  }

  initialize(...args) {
    super.initialize(...args);

    this.model.set('_isInitial', true);
    this.model.set('_activeItemIndex', 0);
    this.onNavigationClicked = this.onNavigationClicked.bind(this);
    this.openPopup = this.openPopup.bind(this);
  }

  preRender() {
    this.listenTo(Adapt, {
      'device:changed device:resize': this.reRender,
      'notify:closed': this.closeNotify
    });
    this.renderMode();

    this.listenTo(this.model.getChildren(), 'change:_isActive', this.onItemsActiveChange);

    this.calculateWidths();
  }

  setFocus(itemIndex) {
    const $animatedElement = this.isLargeMode() || this.model.get('_isMobileTextBelowImage')
      ? this.$('.narrative__slider')
      : this.$('.narrative__strapline-header-inner');
    const hasAnimation = ($animatedElement.css('transitionDuration') !== '0s');
    if (hasAnimation) {
      $animatedElement.one('transitionend', () => this.focusOnNarrativeElement(itemIndex));
      return;
    }
    // Allow dom to settle before moving focus
    requestAnimationFrame(() => {
      this.focusOnNarrativeElement(itemIndex);
    });
  }

  focusOnNarrativeElement(itemIndex) {
    const dataIndexAttr = `[data-index='${itemIndex}']`;
    const $elementToFocus = this.isLargeMode() || this.model.get('_isMobileTextBelowImage')
      ? this.$(`.narrative__content-item${dataIndexAttr}`)
      : this.$(`.narrative__strapline-btn${dataIndexAttr}`);
    a11y.focusFirst($elementToFocus);
    // Set button labels after focus to stop the change reading on a focused button
    this.setupBackNextLabels();
    this.manageBackNextStates();
  }

  onItemsActiveChange(item, _isActive) {
    if (!_isActive) return;

    if (this.isTextBelowImage()) {
      item.toggleVisited(true);
    }

    const index = item.get('_index');
    this.model.set('_activeItemIndex', index);

    this.setStage(item);

    if (this.model.get('_isInitial')) {
      this.setupBackNextLabels();
      this.manageBackNextStates();
      return;
    }
    this.setFocus(index);
  }

  calculateMode() {
    const mode = device.isScreenSizeMin('medium') ? MODE.LARGE : MODE.SMALL;
    this.model.set('_mode', mode);
    this.model.set('_isLargeMode', mode === MODE.LARGE);
    return mode;
  }

  renderMode() {
    const mode = this.calculateMode();
    this.setupEventListeners();

    const isTextBelowImage = this.isTextBelowImage();
    this.model.set('_isTextBelowImageResolved', isTextBelowImage);

    const isLargeMode = (mode === MODE.LARGE);
    const isSmallModeAndTextBelowImage = (mode === MODE.SMALL && isTextBelowImage);
    const hasNavigationInTextArea = this.model.get('_hasNavigationInTextArea') && (isLargeMode || isSmallModeAndTextBelowImage);
    this.model.set('_hasNavigationInTextAreaResolved', hasNavigationInTextArea);
  }

  isLargeMode() {
    return this.model.get('_mode') === MODE.LARGE;
  }

  isTextBelowImage() {
    const isTextBelowImage = (device.isScreenSizeMin('medium'))
      ? this.model.get('_isTextBelowImage')
      : this.model.get('_isMobileTextBelowImage');
    return Boolean(isTextBelowImage);
  }

  postRender() {
    this.renderMode();
    this.setupNarrative();
    this.$('.narrative__slider').imageready(this.setReadyStatus.bind(this));
    this.$('.narrative__slide-container')[0]?.addEventListener('scroll', this.onScroll, true);
  }

  setupNarrative() {
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
    this.setupEventListeners();
    this.model.set('_isInitial', false);
  }

  calculateWidths() {
    const itemCount = this.model.getChildren().length;
    this.model.set({
      _totalWidth: 100 * itemCount,
      _itemWidth: 100 / itemCount
    });
  }

  resizeControl() {
    this.renderMode();
    this.setupBackNextLabels();
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

  replaceWithHotgraphic() {
    const HotgraphicView = components.getViewClass('hotgraphic');
    if (!HotgraphicView) return;

    const model = this.prepareHotgraphicModel();
    const newHotgraphic = new HotgraphicView({ model });

    const parentView = data.findViewByModelId(model.get('_parentId'));
    const $container = parentView.$el.find('.component__container');
    $container.append(newHotgraphic.$el);

    const parentChildViews = parentView.getChildViews();
    const currentIndex = parentChildViews.findIndex(view => view === this);
    parentChildViews[currentIndex] = newHotgraphic;
    parentView.setChildViews(parentChildViews);

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

    this.model.set('_translateXOffset', offset);
  }

  setStage(item) {
    const index = item.get('_index');

    if (this.isLargeMode()) {
      item.toggleVisited(true);
    }

    this.evaluateCompletion();
    this.shouldShowInstructionError();
    this.moveSliderToIndex(index);
  }

  /**
   * Controls whether the back and next buttons should be enabled
   *
   * @param {Number} [index] Item's index value. Defaults to the currently active item.
   */
  manageBackNextStates(index = this.model.getActiveItem().get('_index')) {
    const totalItems = this.model.getChildren().length;

    const shouldEnableBack = index > 0;
    const shouldEnableNext = index < totalItems - 1;

    this.model.set('shouldEnableBack', shouldEnableBack);
    this.model.set('shouldEnableNext', shouldEnableNext);
  }

  /**
   * Construct back and next aria labels
   *
   * @param {Number} [index] Item's index value.
   */
  setupBackNextLabels(index = this.model.getActiveItem().get('_index')) {
    const totalItems = this.model.getChildren().length;

    const isAtStart = index === 0;
    const isAtEnd = index === totalItems - 1;

    const globals = Adapt.course.get('_globals');
    const narrativeGlobals = globals._components._narrative;

    let prevTitle = isAtStart ? '' : this.model.getItem(index - 1).get('title');
    let nextTitle = isAtEnd ? '' : this.model.getItem(index + 1).get('title');

    let backItem = isAtStart ? null : index;
    let nextItem = isAtEnd ? null : index + 2;

    if (isAtStart) {
      prevTitle = this.model.getItem(totalItems - 1).get('title');
      backItem = totalItems;
    }
    if (isAtEnd) {
      nextTitle = this.model.getItem(0).get('title');
      nextItem = 1;
    }

    const backLabel = compile(narrativeGlobals.previous, {
      _globals: globals,
      title: prevTitle,
      itemNumber: backItem,
      totalItems
    });

    const nextLabel = compile(narrativeGlobals.next, {
      _globals: globals,
      title: nextTitle,
      itemNumber: nextItem,
      totalItems
    });

    this.model.set('backLabel', backLabel);
    this.model.set('nextLabel', nextLabel);
  }

  evaluateCompletion() {
    if (this.model.areAllItemsCompleted()) {
      this.trigger('allItems');
      this.$('.narrative__instruction').removeClass('has-error');
    }
  }

  openPopup() {
    const globals = Adapt.course.get('_globals');
    const narrativeGlobals = globals._components._narrative;
    const totalItems = this.model.getChildren().length;
    const currentItem = this.model.getActiveItem();
    const index = currentItem.get('_index');
    const defaultTitle = compile(narrativeGlobals.titleDialog, {
      itemNumber: index + 1,
      totalItems
    });
    const title = currentItem.get('title') || currentItem.get('strapline') || defaultTitle;
    const isAltTitle = Boolean(!currentItem.get('title'));

    notify.popup({
      isAltTitle,
      title,
      body: currentItem.get('body')
    });

    Adapt.on('popup:opened', function() {
      // Set the visited attribute for small and medium screen devices
      currentItem.toggleVisited(true);
    });
  }

  onNavigationClicked(e) {
    const $btn = $(e.currentTarget);
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

  onScroll (event) {
    event.preventDefault();
    event.target.scrollTo(0, 0);
  }

  /**
   * In mobile view, highlight instruction if user navigates to another
   * item before completing, in case the strapline is missed
   */
  shouldShowInstructionError() {
    const prevItemIndex = this.model.getActiveItem().get('_index') - 1;
    if (prevItemIndex < 0 || this.model.getItem(prevItemIndex).get('_isVisited')) return;
    this.$('.narrative__instruction').addClass('has-error');
  }

  shouldUseInviewCompletion() {
    const config = this.model;
    const setCompletionOn = config.get('_setCompletionOn');
    const isMobileAndStacked = config.get('_isStackedOnMobile') && !config.get('_isLargeMode');

    if (!isMobileAndStacked && setCompletionOn !== 'inview') { return false; }

    return true;
  }

  setupEventListeners() {
    if (!this.shouldUseInviewCompletion()) return;

    this.setupInviewCompletion('.component__widget');
  }

  preRemove() {
    this.$('.narrative__slide-container')[0]?.removeEventListener('scroll', this.onScroll, true);
  }
}

NarrativeView.template = 'narrative.jsx';

export default NarrativeView;
