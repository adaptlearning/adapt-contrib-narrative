define([
    'core/js/adapt',
    './narrativeView',
    './narrativeModel'
],function(Adapt, NarrativeView, NarrativeModel) {

    return Adapt.register('narrative', {
        model: NarrativeModel,
        view: NarrativeView
    });

});