import React from 'react';
import MODE from '../js/modeEnum';
import { templates, classes } from 'core/js/reactHelpers';

export default function Narrative(props) {

  const {
    _hasNavigationInTextArea,
    _mode,
    _isTextBelowImageResolved
  } = props;

  return (
    <div className={classes([
      'component__inner narrative__inner',
      _mode === MODE.LARGE ? 'mode-large' : 'mode-small',
      _isTextBelowImageResolved && 'items-are-full-width'
    ])}
    >

      <templates.header {...props} />

      <div className={classes([
        'component__widget narrative__widget',
        _hasNavigationInTextArea && 'narrative__text-controls'
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
