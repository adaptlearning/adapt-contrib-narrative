define([
    'core/js/adapt',
    'core/js/models/componentItemsModel',
    './narrativeView'
], function(Adapt, ComponentItemsModel, NarrativeView) {

    return Adapt.register('narrative', {
        view: NarrativeView,
        // Use the ComponentItemsModel directly - no need to extend
        model: ComponentItemsModel
    });

});
