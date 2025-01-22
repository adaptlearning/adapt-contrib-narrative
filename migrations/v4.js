import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
let narratives, course, courseNarrativeGlobals;

describe('Narrative - v3.0.3 to v4.0.0', async () => {
  const originalAriaRegion = 'This component displays an image gallery with accompanying text. Use the next and back navigation controls to work through the narrative.';
  whereFromPlugin('Narrative - from v3.0.3', { name: 'adapt-contrib-narrative', version: '<4.0.0' });
  whereContent('Narrative - where narrative', async content => {
    narratives = content.filter(({ _component }) => _component === 'narrative');
    if (narratives) return true;
  });
  mutateContent('Narrative - add item _ariaLevel attribute', async (content) => {
    narratives.forEach(item => {
      item._items.forEach(_items => {
        _items._ariaLevel = 0;
      });
    });
    return true;
  });
  mutateContent('Narrative - modify globals ariaRegion attribute', async (content) => {
    course = content.filter(({ _type }) => _type === 'course');
    courseNarrativeGlobals = course?._globals?._components?._narrative;
    if (courseNarrativeGlobals) {
      if(courseNarrativeGlobals.ariaRegion === originalAriaRegion) courseNarrativeGlobals.ariaRegion = 'Narrative. Select the next button to progress.';
    }
    return true;
  });
  checkContent('Narrative - check globals ariaRegion attribute', async (content) => {
    if (courseNarrativeGlobals) {
      const isValid = courseNarrativeGlobals.filter(({ ariaRegion }) => ariaRegion === 'Narrative. Select the next button to progress.');
      console.log(isValid);
      if (!isValid) throw new Error('Narrative - ariaRegion attribute missing');
    }
    return true;
  });
  checkContent('Narrative - check item _ariaLevel', async (content) => {
    console.log(narratives);
    const isValid = narratives.filter(({ _ariaLevel }) => _ariaLevel === 0);
    if (!isValid) throw new Error('Narrative - _ariaLevel attribute missing');
    return true;
  });
  updatePlugin('Narrative - update to v4.0.0', { name: 'adapt-contrib-narrative', version: '4.0.0', framework: '>=4.0.0' });
});
