import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getComponents, getCourse, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Narrative - v7.3.1 to v7.4.0', async () => {
  let narratives;
  const originalInstruction = 'Select the forward arrows to move through the narrative on a desktop, or swipe the images and select the plus icons to do so on mobile.';
  const originalMobileInstruction = 'This is optional instruction text that will be shown when viewed on mobile.';
  whereFromPlugin('Narrative - from v7.3.1', { name: 'adapt-contrib-narrative', version: '<7.4.0' });
  whereContent('Narrative - where narrative', async (content) => {
    narratives = getComponents('narrative');
    return narratives.length;
  });
  mutateContent('Narrative - update default instruction text', async (content) => {
    narratives.forEach(item => {
      if (item.instruction === originalInstruction) {
        item.instruction = 'Select the next and back arrows to find out more.';
      }
    });
    return true;
  });
  mutateContent('Narrative - update default mobile instruction text', async (content) => {
    narratives.forEach(item => {
      if (item.mobileInstruction === originalMobileInstruction) {
        item.mobileInstruction = 'Select the plus icon followed by the next arrow to find out more.';
      }
    });
    return true;
  });
  checkContent('Narrative - check default instruction text', async (content) => {
    const isInvalid = narratives.some(({ instruction }) => instruction === 'Select the forward arrows to move through the narrative on a desktop, or swipe the images and select the plus icons to do so on mobile.');
    if (isInvalid) throw new Error('Narrative - default instruction is invalid');
    return true;
  });
  checkContent('Narrative - check default mobileInstruction text', async (content) => {
    const isInvalid = narratives.some(({ mobileInstruction }) => mobileInstruction === 'This is optional instruction text that will be shown when viewed on mobile.');
    if (isInvalid) throw new Error('Narrative - default mobile instruction is invalid');
    return true;
  });
  updatePlugin('Narrative - update to v7.4.0', { name: 'adapt-contrib-narrative', version: '7.4.0', framework: '>=5.20.1' });

  testSuccessWhere('correct version with narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.3.1' }],
    content: [
      { _id: 'c-100', _component: 'narrative', instruction: 'custom instruction', mobileInstruction: 'custom mobile instruction', _items: [{ title: 'title 1' }] },
      { _id: 'c-105', _component: 'narrative', instruction: originalInstruction, mobileInstruction: originalMobileInstruction, _items: [{ title: 'title 1' }] },
      { _id: 'c-110', _component: 'narrative', _items: [{ title: 'title 1' }] }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.4.0' }]
  });

  testStopWhere('no narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.3.1' }],
    content: [{ _component: 'other' }]
  });
});

describe('Narrative - v7.4.10 to v7.4.11', async () => {
  let narratives;
  whereFromPlugin('Narrative - from v7.4.10', { name: 'adapt-contrib-narrative', version: '<7.4.11' });
  whereContent('Narrative - where narrative', async (content) => {
    narratives = getComponents('narrative');
    return narratives.length;
  });
  mutateContent('Narrative - add _isStackedOnMobile attribute', async (content) => {
    narratives.forEach(narrative => {
      narrative._isStackedOnMobile = false;
    });
    return true;
  });
  checkContent('Narrative - check _isStackedOnMobile attribute', async (content) => {
    const isValid = narratives.every(({ _isStackedOnMobile }) => _isStackedOnMobile !== undefined);
    if (!isValid) throw new Error('Narrative - _isStackedOnMobile attribute is missing');
    return true;
  });
  updatePlugin('Narrative - update to v7.4.11', { name: 'adapt-contrib-narrative', version: '7.4.11', framework: '>=5.31.2' });

  testSuccessWhere('correct version with narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.4.10' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ title: 'title 1' }] },
      { _id: 'c-105', _component: 'narrative', _items: [{ title: 'title 1' }] }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.4.11' }]
  });

  testStopWhere('no narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.4.10' }],
    content: [{ _component: 'other' }]
  });
});

describe('Narrative - v7.4.13 to v7.5.0', async () => {
  let narratives;
  whereFromPlugin('Narrative - from v7.4.13', { name: 'adapt-contrib-narrative', version: '<7.5.0' });
  whereContent('Narrative - where narrative', async (content) => {
    narratives = getComponents('narrative');
    return narratives.length;
  });
  mutateContent('Narrative - remove _ariaLevel override attribute', async (content) => {
    narratives.forEach(narrative => {
      const narrativeItems = narrative._items.filter(({ _ariaLevel }) => _ariaLevel !== undefined);
      narrativeItems.forEach((item) => {
        delete item._ariaLevel;
      });
    });
    return true;
  });
  checkContent('Narrative - check _ariaLevel attribute', async (content) => {
    const isInvalid = narratives.some(narrative => narrative._items?.some(item => _.has(item, '_ariaLevel')));
    if (isInvalid) throw new Error('Narrative - _ariaLevel is invalid');
    return true;
  });
  updatePlugin('Narrative - update to v7.5.0', { name: 'adapt-contrib-narrative', version: '7.5.0', framework: '>=5.31.2' });

  testSuccessWhere('correct version with narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.4.13' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ title: 'title 1' }] },
      { _id: 'c-105', _component: 'narrative', _items: [{ title: 'title 1', _ariaLevel: 0 }] }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.5.0' }]
  });

  testStopWhere('no narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.4.13' }],
    content: [{ _component: 'other' }]
  });
});

describe('Narrative - v7.7.1 to v7.8.0', async () => {
  let course, courseNarrativeGlobals, narratives;
  const originalPreviousMsg = '{{#if title}}Back to {{{title}}} (item {{itemNumber}} of {{totalItems}}){{else}}{{_globals._accessibility._ariaLabels.previous}}{{/if}}';
  const originalNextMsg = '{{#if title}}Forward to {{{title}}} (item {{itemNumber}} of {{totalItems}}){{else}}{{_globals._accessibility._ariaLabels.next}}{{/if}}';
  whereFromPlugin('Narrative - from v7.7.1', { name: 'adapt-contrib-narrative', version: '<7.8.0' });
  whereContent('Narrative - where narrative', async (content) => {
    narratives = getComponents('narrative');
    return narratives.length;
  });
  mutateContent('Narrative - add globals if missing', async (content) => {
    course = getCourse();
    if (!_.has(course, '_globals._components._narrative')) _.set(course, '_globals._components._narrative', {});
    courseNarrativeGlobals = course._globals._components._narrative;
    return true;
  });
  mutateContent('Narrative - update global previous text', async (content) => {
    if (courseNarrativeGlobals.previous === originalPreviousMsg) courseNarrativeGlobals.previous = '{{#if title}}Back to {{{title}}}{{else}}{{_globals._accessibility._ariaLabels.previous}}{{/if}} (item {{itemNumber}} of {{totalItems}})';

    return true;
  });
  mutateContent('Narrative - update global next text', async (content) => {
    if (courseNarrativeGlobals.next === originalNextMsg) courseNarrativeGlobals.next = '{{#if title}}Forward to {{{title}}}{{else}}{{_globals._accessibility._ariaLabels.next}}{{/if}} (item {{itemNumber}} of {{totalItems}})';

    return true;
  });
  checkContent('Narrative - check global previous text', async (content) => {
    const isInvalid = courseNarrativeGlobals.previous === originalPreviousMsg;
    if (isInvalid) throw new Error('Narrative - global narrative previous text is invalid');
    return true;
  });
  checkContent('Narrative - check global next text', async (content) => {
    const isInvalid = courseNarrativeGlobals.next === originalNextMsg;
    if (isInvalid) throw new Error('Narrative - global narrative next text is invalid');
    return true;
  });
  updatePlugin('Narrative - update to v7.8.0', { name: 'adapt-contrib-narrative', version: '7.9.3', framework: '>=5.31.2' });

  testSuccessWhere('correct version with narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.7.1' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ title: 'title 1' }] },
      { _type: 'course' }
    ]
  });

  testSuccessWhere('correct version with narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.7.1' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ title: 'title 1' }] },
      { _type: 'course', _globals: { _components: { _narrative: { previous: originalPreviousMsg, next: originalNextMsg } } } }
    ]
  });

  testSuccessWhere('correct version with narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.7.1' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ title: 'title 1' }] },
      { _type: 'course', _globals: { _components: { _narrative: { previous: 'custom previous', next: 'custom next' } } } }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.8.0' }]
  });

  testStopWhere('no narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '7.7.1' }],
    content: [{ _component: 'other' }]
  });
});
