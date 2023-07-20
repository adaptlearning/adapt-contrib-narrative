import React from 'react';
import { templates, classes } from 'core/js/reactHelpers';

export default function NarrativeSlideContainer(props) {

  const {
    _items,
    _isLargeMode,
    _isStackedOnMobile,
    _translateXOffset,
    onNavigationClicked,
    _itemWidth,
    _totalWidth,
    backLabel,
    nextLabel,
    shouldEnableBack,
    shouldEnableNext
  } = props;

  if (_isStackedOnMobile && !_isLargeMode) {
    return false;
  }

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

            <templates.image {..._graphic}
              classNamePrefixes={['narrative__slider-image js-narrative-swipe']}
              attributionClassNamePrefixes={['component', 'narrative']}
              draggable="false"
            />

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
