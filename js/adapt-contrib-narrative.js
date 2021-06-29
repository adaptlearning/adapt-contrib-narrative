import Adapt from 'core/js/adapt';
import NarrativeModel from './NarrativeModel';
import NarrativeView from './NarrativeView';

export default Adapt.register('narrative', {
  model: NarrativeModel,
  view: NarrativeView
});
