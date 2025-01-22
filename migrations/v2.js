import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
let narratives;

describe('Narrative - v2.0.7 to v2.0.8', async () => {
  whereFromPlugin('Narrative - from v2.0.7', { name: 'adapt-contrib-narrative', version: '<2.0.8' });
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
    const isValid = narratives.includes((narrative) => narrative._graphic.attribution);
    console.log(isValid);
    if (!isValid) throw new Error('Narrative - no graphic attribution found');
    return true;
  });
  updatePlugin('Narrative - update to v2.0.8', { name: 'adapt-contrib-narrative', version: '2.0.8', framework: '>=2.0.0' });
});
