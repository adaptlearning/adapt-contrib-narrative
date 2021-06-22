import Adapt from 'core/js/adapt';
import NarrativeModel from './narrativeModel';
import NarrativeView from './narrativeView';

export default Adapt.register('narrative', {
  model: NarrativeModel,
  view: NarrativeView
});
