define([
    'core/js/adapt',
    'core/js/models/itemsComponentModel'
], function(Adapt, ItemsComponentModel) {
    'use strict';
    
    const NarrativeModel = ItemsComponentModel.extend({
        
        defaults: function() {
            return _.extend({}, _.result(ItemsComponentModel.prototype, 'defaults'), {
                '_marginDir': 'left'
            });
        },

        getItemCount: function() {
            return this.get('_items').length;
        },

        setup: function() {
            this.setupSlideDirection();
            this.set('_active', true); // remove?
        },

        setupSlideDirection: function() {
            if (Adapt.config.get('_defaultDirection') == 'rtl') {
                this.set('_marginDir', 'right');
            }
        },

        constrainStage: function(stage) {
            if (stage > this.getItemCount() - 1) {
                stage = this.getItemCount() - 1;
            } else if (stage < 0) {
                stage = 0;
            }
            return stage;
        },

        constrainXPosition: function(previousLeft, newLeft, deltaX) {
            if (newLeft > 0 && deltaX > 0) {
                newLeft = previousLeft + (deltaX / (newLeft * 0.1));
            }
            var finalItemLeft = this.get('_finalItemLeft');
            if (newLeft < -finalItemLeft && deltaX < 0) {
                var distance = Math.abs(newLeft + finalItemLeft);
                newLeft = previousLeft + (deltaX / (distance * 0.1));
            }
            return newLeft;
        },

        setItemActive: function(index) {
            this.getActiveItem().toggleActive(false);
            this.getItem(index).toggleActive(true);
        },

        prepareHotgraphicModel: function() {
            var model = this;
            model.set('_component', 'hotgraphic');
            model.set('body', model.get('originalBody'));
            model.set('instruction', model.get('originalInstruction'));
            return model;
        },
        
    });

    return NarrativeModel;

});