define([
    'core/js/adapt',
    'core/js/models/itemsModel'
], function(Adapt, ItemsModel) {

    var NarrativeModel = ItemsModel.extend({

        defaults: function() {
            return _.extend(_.result(ItemsModel.prototype, "defaults"), {
                _activeItem: 0
            });
        },

        initialize: function() {
            this.set('_marginDir', 'left');
            if (Adapt.config.get('_defaultDirection') == 'rtl') {
                this.set('_marginDir', 'right');
            }
            this.set('_itemCount', this.get('_items').length);
        },

        prepareNarrativeModel: function() {
            this.set('_component', 'narrative');
            this.set('_wasHotgraphic', true);
            this.set('originalBody', this.get('body'));
            this.set('originalInstruction', this.get('instruction'));
            this.set('_activeItem', (this.get('_activeItem') === -1) ? 0 : this.get('_activeItem'));

            if (this.get('mobileBody')) {
                this.set('body', this.get('mobileBody'));
            }
            if (this.get('mobileInstruction')) {
                this.set('instruction', this.get('mobileInstruction'));
            }

            return this;
        },

        checkCompletionStatus: function() {
            ItemsModel.prototype.checkCompletionStatus.apply(this, arguments);
            
            if (this.getCompletionStatus()) {
                this.trigger('allItems');
            }
        },

    });

    return NarrativeModel;

});
