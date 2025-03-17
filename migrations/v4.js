import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getComponents, getCourse, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Narrative - v3.0.3 to v4.0.0', async () => {
  let course, courseNarrativeGlobals, narratives;
  const originalAriaRegion = 'This component displays an image gallery with accompanying text. Use the next and back navigation controls to work through the narrative.';

  whereFromPlugin('Narrative - from v3.0.3', { name: 'adapt-contrib-narrative', version: '<4.0.0' });

  whereContent('Narrative - where narrative', async content => {
    narratives = getComponents('narrative');
    return narratives.length;
  });

  mutateContent('Narrative - add item _ariaLevel attribute', async (content) => {
    narratives.forEach(item => {
      item._items.forEach(_items => {
        _items._ariaLevel = 0;
      });
    });
    return true;
  });

  mutateContent('Narrative - add globals if missing', async (content) => {
    course = getCourse();
    if (!_.has(course, '_globals._components._narrative.ariaRegion')) _.set(course, '_globals._components._narrative.ariaRegion', originalAriaRegion);
    courseNarrativeGlobals = course._globals._components._narrative;
    return true;
  });

  mutateContent('Narrative - modify globals ariaRegion attribute', async (content) => {
    if (courseNarrativeGlobals) {
      if (courseNarrativeGlobals.ariaRegion === originalAriaRegion) courseNarrativeGlobals.ariaRegion = 'Narrative. Select the next button to progress.';
    }
    return true;
  });

  checkContent('Narrative - check globals ariaRegion attribute', async (content) => {
    if (courseNarrativeGlobals) {
      const isValid = courseNarrativeGlobals.ariaRegion !== originalAriaRegion;
      if (!isValid) throw new Error('Narrative - ariaRegion attribute missing');
    }
    return true;
  });

  checkContent('Narrative - check item _ariaLevel', async (content) => {
    const isValid = narratives.filter(({ _ariaLevel }) => _ariaLevel === 0);
    if (!isValid) throw new Error('Narrative - _ariaLevel attribute missing');
    return true;
  });

  updatePlugin('Narrative - update to v4.0.0', { name: 'adapt-contrib-narrative', version: '4.0.0', framework: '>=4.0.0' });

  testSuccessWhere('narrative component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '3.0.3' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ title: 'title 1' }] },
      { _type: 'course' }
    ]
  });

  testSuccessWhere('narrative component with originalAriaRegion', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '3.0.3' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ title: 'title 1' }] },
      { _type: 'course', _globals: { _components: { _narrative: { ariaRegion: originalAriaRegion } } } }
    ]
  });

  testSuccessWhere('narrative component with custom ariaRegion', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '3.0.3' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ title: 'title 1' }] },
      { _type: 'course', _globals: { _components: { _narrative: { ariaRegion: 'custom ariaRegion' } } } }
    ]
  });

  testSuccessWhere('narrative component with empty globals', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '3.0.3' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ title: 'title 1' }] },
      { _type: 'course', _globals: { _components: { _narrative: {} } } }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '4.0.0' }]
  });

  testStopWhere('no narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '3.0.3' }],
    content: [{ _component: 'other' }]
  });
});
