import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';

describe('Narrative - v6.1.0 to v6.2.0', async () => {
  let course, courseNarrativeGlobals, narratives;
  whereFromPlugin('Narrative - from v6.1.0', { name: 'adapt-contrib-narrative', version: '<6.2.0' });
  whereContent('Narrative - where narrative', async (content) => {
    narratives = content.filter(({ _component }) => _component === 'narrative');
    if (narratives) return true;
  });
  mutateContent('Narrative - add globals if missing', async (content) => {
    course = content.find(({ _type }) => _type === 'course');
    if (course?._globals?._components?._narrative) return true;

    course._globals._components = course._globals._components ?? {};
    courseNarrativeGlobals = course._globals._components._narrative ?? {};
    return true;
  });
  mutateContent('Narrative - add previous globals', async (content) => {
    courseNarrativeGlobals.previous = '{{#if title}}Back to {{title}} (item {{itemNumber}} of {{totalItems}}){{else}}{{_globals._accessibility._ariaLabels.previous}}{{/if}}';
    return true;
  });
  mutateContent('Narrative - add next globals', async (content) => {
    courseNarrativeGlobals.next = '{{#if title}}Forward to {{title}} (item {{itemNumber}} of {{totalItems}}){{else}}{{_globals._accessibility._ariaLabels.next}}{{/if}}';
    return true;
  });
  checkContent('Narrative - check narrative globals previous', async (content) => {
    const isValid = courseNarrativeGlobals.previous === '{{#if title}}Back to {{title}} (item {{itemNumber}} of {{totalItems}}){{else}}{{_globals._accessibility._ariaLabels.previous}}{{/if}}';
    if (!isValid) throw new Error('Narrative globals previous missing');
    return true;
  });
  checkContent('Narrative - check narrative globals next', async (content) => {
    const isValid = courseNarrativeGlobals.next === '{{#if title}}Forward to {{title}} (item {{itemNumber}} of {{totalItems}}){{else}}{{_globals._accessibility._ariaLabels.next}}{{/if}}';
    if (!isValid) throw new Error('Narrative globals next missing');
    return true;
  });
  updatePlugin('Narrative - update to v6.2.0', { name: 'adapt-contrib-narrative', version: '6.2.0', framework: '>=5.5.0' });
});

describe('Narrative - v6.3.0 to v6.4.0', async () => {
  let narratives;
  whereFromPlugin('Narrative - from v6.3.0', { name: 'adapt-contrib-narrative', version: '<6.4.0' });
  whereContent('Narrative - where narrative', async (content) => {
    narratives = content.filter(({ _component }) => _component === 'narrative');
    if (narratives) return true;
  });
  mutateContent('Narrative - add _isTextBelowImage attribute', async (content) => {
    narratives.forEach(item => (item._isTextBelowImage = false));
    return true;
  });
  mutateContent('Narrative - add _isMobileTextBelowImage attribute', async (content) => {
    narratives.forEach(item => (item._isMobileTextBelowImage = false));
    return true;
  });
  checkContent('Narrative - check _isTextBelowImage attribute', async (content) => {
    const isValid = narratives.some((narrative) => narrative._isTextBelowImage === false);
    if (!isValid) throw new Error('found invalid _isTextBelowImage attribute');
    return true;
  });
  checkContent('Narrative - check _isMobileTextBelowImage attribute', async (content) => {
    const isValid = narratives.some((narrative) => narrative._isMobileTextBelowImage === false);
    if (!isValid) throw new Error('found invalid _isMobileTextBelowImage attribute');
    return true;
  });
  updatePlugin('Narrative - update to v6.4.0', { name: 'adapt-contrib-narrative', version: '6.4.0', framework: '>=5.8.0' });
});
