import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
let narratives;

describe('Narrative - v2.0.7 to v2.1.0', async () => {
  whereFromPlugin('Narrative - from v2.0.7', { name: 'adapt-contrib-narrative', version: '<2.1.0' });
  whereContent('Narrative - where narratives', async (content) => {
    narratives = content.filter(({ _component }) => _component === 'narrative');
    if (narratives.length) return true;
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
    const isValid = narratives.every(narrative =>
      narrative._items.every(item =>
        item._graphic && item._graphic.attribution !== undefined
      )
    );
    if (!isValid) throw new Error('Narrative - no graphic attribution found');
    return true;
  });
  updatePlugin('Narrative - update to v2.1.0', { name: 'adapt-contrib-narrative', version: '2.1.0', framework: '>=2.0.0' });
});
