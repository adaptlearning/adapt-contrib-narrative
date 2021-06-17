import Adapt from 'core/js/adapt';
import NarrativeView from './narrativeView';
import NarrativeModel from './narrativeModel';

export default Adapt.register('narrative', {
  model: NarrativeModel,
  view: NarrativeView
});
