import React from 'react';
import { classes } from 'core/js/reactHelpers';

export default function NarrativeIndicators(props) {
  return (
    <div className="narrative__indicators narrative__slide-indicators">

      {props._items.map(({ _index, _isVisited, _isActive }) =>
        <div
          className={classes([
            'narrative__progress',
            _isVisited && 'is-visited',
            _isActive && 'is-selected'
          ])}
          data-index={_index}
          key={_index}
        />
      )}

    </div>
  );
}
