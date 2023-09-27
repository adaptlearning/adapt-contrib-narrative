import React from 'react';
import { templates, classes } from 'core/js/reactHelpers';

export default function Narrative(props) {

  const {
    _hasNavigationInTextAreaResolved,
    _isLargeMode,
    _isStackedOnMobile,
    _isTextBelowImageResolved
  } = props;

  return (
    <div className={classes([
      'component__inner narrative__inner',
      _isLargeMode ? 'mode-large' : 'mode-small',
      _isTextBelowImageResolved && 'items-are-full-width',
      (_isStackedOnMobile && !_isLargeMode) && 'is-stacked'
    ])}
    >

      <templates.header {...props} />

      <div className={classes([
        'component__widget narrative__widget',
        _hasNavigationInTextAreaResolved && 'narrative__text-controls'
      ])}
      >

        <templates.narrativeContent {...props} />

        <templates.narrativeStrapline {...props} />

        <templates.narrativeSlideContainer {...props} />

        <templates.narrativeIndicators {...props} />

      </div>

    </div>
  );
}
