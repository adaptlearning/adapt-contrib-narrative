import React from 'react';
import Adapt from 'core/js/adapt';
import { compile, classes } from 'core/js/reactHelpers';

export default function NarrativeStrapline(props) {

  const {
    _items,
    _isLargeMode,
    _isStackedOnMobile,
    _translateXOffset,
    openPopup,
    _itemWidth,
    _totalWidth
  } = props;

  if (_isStackedOnMobile && !_isLargeMode) {
    return false;
  }

  const globals = Adapt.course.get('_globals')._components._narrative;

  return (
    <div className="narrative__strapline">

      <div className="narrative__strapline-header">
        <div
          className="narrative__strapline-header-inner u-clearfix"
          style={{
            width: `${_totalWidth}%`,
            transform: `translateX(${_translateXOffset}%)`
          }}
        >

          {_items.map(({ _index, _isActive, _isVisited, strapline, title }) =>

            <button
              className={classes([
                'narrative__strapline-btn',
                _isVisited && 'is-visited'
              ])}
              aria-label={strapline}
              tabIndex={_isActive ? 0 : -1}
              aria-hidden={!_isActive || null}
              style={{ width: `${_itemWidth}%` }}
              onClick={openPopup}
              data-index={_index}
              key={_index}
            >

              <span className="narrative__strapline-title">
                <span
                  className="narrative__strapline-title-inner"
                  dangerouslySetInnerHTML={{ __html: compile(strapline || title || globals.titleStrapline, props) }}
                />
              </span>

              <span className="btn-icon narrative__strapline-icon">
                <span className="icon" aria-hidden="true" />
              </span>

            </button>

          )}

        </div>
      </div>

    </div>
  );
}
