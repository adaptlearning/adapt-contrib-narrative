import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getComponents, testSuccessWhere, testStopWhere } from 'adapt-migrations';

describe('Narrative - v2.0.7 to v2.1.0', async () => {
  let narratives;

  whereFromPlugin('Narrative - from v2.0.7', { name: 'adapt-contrib-narrative', version: '<2.1.0' });

  whereContent('Narrative - where narratives', async (content) => {
    narratives = getComponents('narrative');
    return narratives.length;
  });

  mutateContent('Narrative - add ._graphic.attribution attribute', async (content) => {
    narratives.forEach(narrative => {
      narrative._items.forEach(item => {
        item._graphic.attribution = '';
      });
    });
    return true;
  });

  checkContent('Narrative - check ._graphic.attribution attribute', async (content) => {
    const isValid = narratives.every(narrative =>
      narrative._items.every(item =>
        item._graphic?.attribution !== undefined
      )
    );
    if (!isValid) throw new Error('Narrative - no graphic attribution found');
    return true;
  });

  updatePlugin('Narrative - update to v2.1.0', { name: 'adapt-contrib-narrative', version: '2.1.0', framework: '>=2.0.0' });

  testSuccessWhere('correct version with narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '2.0.7' }],
    content: [
      { _id: 'c-100', _component: 'narrative', _items: [{ _graphic: {} }] },
      { _id: 'c-105', _component: 'narrative', _items: [{ _graphic: {} }] }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '2.1.0' }]
  });

  testStopWhere('no narrative components', {
    fromPlugins: [{ name: 'adapt-contrib-narrative', version: '2.0.7' }],
    content: [{ _component: 'other' }]
  });
});
