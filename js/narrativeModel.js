define([
    'core/js/adapt',
    'core/js/models/itemsModel'
], function(Adapt, ItemsModel) {

    var NarrativeModel = ItemsModel.extend({

        initialize: function() {
            this.set('_marginDir', 'left');
            if (Adapt.config.get('_defaultDirection') == 'rtl') {
                this.set('_marginDir', 'right');
            }
            this.set('_itemCount', this.get('_items').length);

            ItemsModel.prototype.initialize.apply(this, arguments);
        },

        prepareNarrativeModel: function() {
            this.set('_component', 'narrative');
            this.set('_wasHotgraphic', true);
            this.set('originalBody', this.get('body'));
            this.set('originalInstruction', this.get('instruction'));
            
            var activeItem = this.getActiveItemsIndexes()[0] || 0;
            this.setItemAtIndexAsActive(activeItem);

            if (this.get('mobileBody')) {
                this.set('body', this.get('mobileBody'));
            }
            if (this.get('mobileInstruction')) {
                this.set('instruction', this.get('mobileInstruction'));
            }

            return this;
        },

        checkCompletionStatus: function() {
            if (this.getCompletionStatus()) {
                this.trigger('allItems');
            }
        },

        reset: function(type, force) {
            ItemsModel.prototype.reset.call(this, type, force);
            this.setItemAtIndexAsActive(0, false);
        }

    });

    return NarrativeModel;

});
