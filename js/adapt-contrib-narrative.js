define([
  'core/js/adapt',
  './narrativeView',
  'core/js/models/itemsComponentModel'
], function(Adapt, NarrativeView, ItemsComponentModel) {

  return Adapt.register('narrative', {
    model: ItemsComponentModel,
    view: NarrativeView
  });

});
