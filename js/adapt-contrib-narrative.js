import Adapt from 'core/js/adapt';
import NarrativeView from './narrativeView';
import ItemsComponentModel from 'core/js/models/itemsComponentModel';

export default Adapt.register('narrative', {
  model: ItemsComponentModel.extend({}),
  view: NarrativeView
});
