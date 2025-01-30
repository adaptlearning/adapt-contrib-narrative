import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
let course, courseNarrativeGlobals, narratives;

describe('Narrative - v3.0.3 to v4.0.0', async () => {
  const originalAriaRegion = 'This component displays an image gallery with accompanying text. Use the next and back navigation controls to work through the narrative.';
  whereFromPlugin('Narrative - from v3.0.3', { name: 'adapt-contrib-narrative', version: '<4.0.0' });
  whereContent('Narrative - where narrative', async content => {
    narratives = content.filter(({ _component }) => _component === 'narrative');
    if (narratives.length) return true;
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
    course = content.find(({ _type }) => _type === 'course');
    if (course?._globals?._components?._narrative) return true;

    course._globals._components = course._globals._components ?? {};
    courseNarrativeGlobals = course._globals._components._narrative ?? {};
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
});
