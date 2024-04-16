import React from 'react';
import { classes } from 'core/js/reactHelpers';

export default function NarrativeIndicators(props) {
  const {
    _items,
    _isLargeMode,
    _isStackedOnMobile
  } = props;

  if (_isStackedOnMobile && !_isLargeMode) {
    return false;
  }

  return (
    <div className="narrative__indicators narrative__slide-indicators">

      {_items.map(({ _index, _isVisited, _isActive }) =>
        <div
          className={classes([
            'narrative__progress',
            _isVisited && 'is-visited',
            _isActive && 'is-selected'
          ])}
          data-index={_index}
          key={_index}
        >
          <span className="icon" aria-hidden="true" />
        </div>
      )}

    </div>
  );
}
