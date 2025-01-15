import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';

describe('Narrative - v3.0.3 > v4.0.0', async () => {
  let narratives, course, courseNarrativeGlobals;
  whereFromPlugin('Narrative - from v3.0.3', { name: 'adapt-contrib-narrative', version: '<=3.0.3' });
  whereContent('Narrative - where narrative', async content => {
    narratives = content.filter(({ _component }) => _component === 'narrative')
    if (narratives) return true;
  });
  mutateContent('Narrative - add item _ariaLevel attribute', async content => {
    narratives.forEach(item => {
      item._items.forEach(_items => _items._ariaLevel = 0);
    });
    return true;
  });
  mutateContent('Narrative - modify globals ariaRegion attribute', async content => {
    course = content.filter(({ _type }) => _type === 'course');
    courseNarrativeGlobals = course?._globals?._components?._narrative;
    if (courseNarrativeGlobals) courseNarrativeGlobals.ariaRegion = "Narrative. Select the next button to progress.";
    return true;
  });
  checkContent('Narrative - check item _ariaLevel attribute', async content => {
    const isValid = courseNarrativeGlobals.includes("Narrative. Select the next button to progress.")
    if (!isValid) throw new Error('Narrative - _ariaLevel attribute missing');
    return true;
  });
  updatePlugin('Narrative - update to v4.0.0', { name: 'adapt-contrib-narrative', version: '4.0.0', framework: '>=4.0.0' });
});
