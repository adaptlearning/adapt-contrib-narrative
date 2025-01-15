import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';

describe('Narrative - v6.1.0 > v6.2.0', async () => {
  let course, courseNarrativeGlobals;
  whereFromPlugin('Narrative - from v6.1.0', { name: 'adapt-contrib-narrative', version: '<=6.1.0' });
  whereContent('Narrative - where narrative globals', async content => {
    course = content.filter(({ _type }) => _type === 'course');
    courseNarrativeGlobals = course?._globals?._components?._narrative;
    if (courseNarrativeGlobals) return true;
  });
  mutateContent('Narrative - add previous globals', async content => {
    courseNarrativeGlobals.previous = "{{#if title}}Back to {{title}} (item {{itemNumber}} of {{totalItems}}){{else}}{{_globals._accessibility._ariaLabels.previous}}{{/if}}"
    return true;
  });
  mutateContent('Narrative - add next globals', async content => {
    courseNarrativeGlobals.next = "{{#if title}}Forward to {{title}} (item {{itemNumber}} of {{totalItems}}){{else}}{{_globals._accessibility._ariaLabels.next}}{{/if}}"
    return true;
  });
  checkContent('Narrative - check narrative globals previous', async content => {
    const isValid = course.includes(({ isInvalid }) => isInvalid);
    if (isValid) throw new Error('found invalid data attribute');
    return true;
  });
  updatePlugin('Narrative - update to v6.4.0', {name: 'adapt-contrib-narrative', version: '6.2.0', framework: '>=5.5.0'});
});

describe('Narrative - v6.3.0 > v6.4.0', async () => {
  let narratives;
  whereFromPlugin('Narrative - from v6.3.0', { name: 'adapt-contrib-narrative', version: '<=6.3.0' });
  whereContent('where content 1', async content => {
    narratives = content.filter(({ _component }) => _component === 'narrative');
    if (narratives) return true;
  });
  mutateContent('Narrative - add _isTextBelowImage attribute', async content => {
    narratives.forEach(item => (item._isTextBelowImage = false));
    return true;
  });
  mutateContent('Narrative - add _isMobileTextBelowImage attribute', async content => {
    narratives.forEach(item => (item._isMobileTextBelowImage = false));
    return true;
  });
  checkContent('Narrative - check _isStackedOnMobile attribute', async content => {
    const isValid = content.some(({ _isTextBelowImage }) => _isTextBelowImage);
    if (!isValid) throw new Error('found invalid _isTextBelowImage attribute');
    return true;
  });
  checkContent('Narrative - check _isMobileTextBelowImage attribute', async content => {
    const isValid = content.some(({ _isMobileTextBelowImage }) => _isMobileTextBelowImage);
    if (!isValid) throw new Error('found invalid _isMobileTextBelowImage attribute');
    return true;
  });
  updatePlugin('Narrative - update to v6.4.0', {name: 'adapt-contrib-narrative', version: '6.4.0', framework: '>=5.8.0'})
});
