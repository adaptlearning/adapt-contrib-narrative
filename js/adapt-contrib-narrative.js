define([
    'coreJS/adapt',
    './narrativeModel',
    './narrativeView'
], function(Adapt, NarrativeModel, NarrativeView) {

    return Adapt.register('narrative', {
        view: NarrativeView,
        model: NarrativeModel
    });

});
