import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
let narratives;

describe('Narrative - v2.0.7 to v2.0.8', async () => {
  whereFromPlugin('Narrative - from v2.0.7', { name: 'adapt-contrib-narrative', version: '<=7.0.7' });
  whereContent('Narrative - where narratives', async (content) => {
    narratives = content.filter(({ _component }) => _component === 'narrative');
    if (narratives) return true;
  });
  mutateContent('Narrative - add ._graphic.attribution attribute', async (content) => {
    narratives.forEach(item => {
      item._items.forEach(_items => {
        _items._graphic.attribution = '';
      });
    });
    return true;
  });
  checkContent('Narrative - check ._graphic.attribution attribute', async (content) => {
    const isInvalid = narratives.includes(({ attribution }) => attribution);
    if (isInvalid) throw new Error('found invalid data attribute');
    return true;
  });
  updatePlugin('Narrative - update to v2.0.8', { name: 'adapt-contrib-narrative', version: '2.0.8', framework: '>=2.0.0' });
});
