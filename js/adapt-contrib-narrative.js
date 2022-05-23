import components from 'core/js/components';
import NarrativeModel from './NarrativeModel';
import NarrativeView from './NarrativeView';

export default components.register('narrative', {
  model: NarrativeModel,
  view: NarrativeView
});
