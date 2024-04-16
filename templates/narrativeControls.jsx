import React from 'react';
import { classes } from 'core/js/reactHelpers';

export default function NarrativeControls(props) {
  const {
    _items,
    _isLargeMode,
    _isStackedOnMobile,
    onNavigationClicked,
    backLabel,
    nextLabel,
    shouldEnableBack,
    shouldEnableNext
  } = props;

  if (_isStackedOnMobile && !_isLargeMode) {
    return false;
  }

  return (
    <div className="narrative__controls-container u-clearfix">

      <button
        data-direction="left"
        className={classes([
          'btn-icon narrative__controls narrative__controls-left',
          !shouldEnableBack && 'is-disabled'
        ])}
        aria-disabled={!shouldEnableBack || null}
        onClick={onNavigationClicked}
      >
        <span className="aria-label" dangerouslySetInnerHTML={{ __html: backLabel }} />
        <span className="icon" aria-hidden="true" />
      </button>

      <div className="narrative__indicators">
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

      <button
        data-direction="right"
        className={classes([
          'btn-icon narrative__controls narrative__controls-right',
          !shouldEnableNext && 'is-disabled'
        ])}
        aria-disabled={!shouldEnableNext || null}
        onClick={onNavigationClicked}
      >
        <span className="aria-label" dangerouslySetInnerHTML={{ __html: nextLabel }} />
        <span className="icon" aria-hidden="true" />
      </button>

    </div>
  );
}
