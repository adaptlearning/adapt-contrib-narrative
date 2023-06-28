import React from 'react';
import a11y from 'core/js/a11y';
import { classes } from 'core/js/reactHelpers';

export default function NarrativeSlideContainer(props) {

  const {
    _items,
    _translateXOffset,
    onNavigationClicked,
    _itemWidth,
    _totalWidth,
    backLabel,
    nextLabel,
    shouldEnableBack,
    shouldEnableNext
  } = props;

  return (
    <div className="narrative__slide-container">

      <div
        className="narrative__slider u-clearfix"
        style={{
          width: `${_totalWidth}%`,
          transform: `translateX(${_translateXOffset}%)`
        }}
      >

        {_items.map(({ _index, _isActive, _isVisited, _graphic }) =>

          <div
            className={classes([
              'narrative__slider-image-container',
              _isActive && 'is-active',
              _isVisited && 'is-visited',
              _graphic.attribution && 'has-attribution'
            ])}
            style={{ width: `${_itemWidth}%` }}
            aria-hidden={!_isActive || null}
            data-index={_index}
            key={_index}
          >

            <img
              className="narrative__slider-image js-narrative-swipe"
              src={_graphic.src}
              aria-label={a11y.normalize(_graphic.alt) || null}
              aria-hidden={!_graphic.alt || null}
              draggable="false"
            />

            {_graphic.attribution &&
            <div className="component__attribution narrative__attribution">
              <div
                className="component__attribution-inner narrative__attribution-inner"
                dangerouslySetInnerHTML={{ __html: _graphic.attribution }}
              />
            </div>
            }

          </div>

        )}

      </div>

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
