import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';

describe('Narrative - v2.0.7 > v2.0.8', async () => {
  let narratives;
  whereFromPlugin('Narrative - from v2.0.7', { name: 'adapt-contrib-narrative', version: '<=2.0.7' });
  whereContent('where content 1', async content => {
    narratives = content.filter(({ _component }) => _component === 'narrative')
    if (narratives) return true;
  });
  mutateContent('Narrative - add ._graphic.attribution attribute', async content => {
    narratives.forEach(item => {
      item._items.forEach(_items => _items._graphic.attribution = "");
    });
    return true;
  });
  checkContent('Narrative - check ._graphic.attribution attribute', async content => {
    const isInvalid = content.some(({ isInvalid }) => isInvalid);
    if (isInvalid) throw new Error('found invalid data attribute');
    return true;
  });
  updatePlugin('Narrative - update to v2.0.8', { name: 'adapt-contrib-narrative', version: '2.0.8', framework: '>=2.0.0' });
});
