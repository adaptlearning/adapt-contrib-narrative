import React from 'react';
import a11y from 'core/js/a11y';
import MODE from '../js/modeEnum';
import { templates, compile, classes } from 'core/js/reactHelpers';

export default function Narrative(props) {

  const {
    _id,
    _items,
    _translateXOffset,
    _hasNavigationInTextArea,
    onNavigationClicked,
    openPopup,
    _itemWidth,
    _totalWidth,
    _mode,
    _isTextBelowImageResolved,
    backLabel,
    nextLabel,
    shouldEnableBack,
    shouldEnableNext
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

        <div className="narrative__content">
          <div className="narrative__content-inner">

            {_items.map(({ _index, _isActive, _isVisited, title, body, _ariaLevel }) =>

              <div
                className={classes([
                  'narrative__content-item',
                  _isActive && 'is-active',
                  _isVisited && 'is-visited'
                ])}
                aria-hidden={!_isActive || null}
                data-index={_index}
                key={_index}
              >

                {title &&
                <div className="narrative__content-title">
                  <div
                    className="narrative__content-title-inner"
                    role="heading"
                    aria-level={a11y.ariaLevel({ id: _id, level: 'componentItem', override: (_ariaLevel || null) })}
                    dangerouslySetInnerHTML={{ __html: compile(title, props) }} />
                </div>
                }

                {body &&
                <div className="narrative__content-body">
                  <div
                    className="narrative__content-body-inner"
                    dangerouslySetInnerHTML={{ __html: compile(body, props) }}
                  />
                </div>
                }

              </div>

            )}

            <div className="narrative__controls-container u-clearfix">

              <button
                data-direction="left"
                className={classes([
                  'btn-icon narrative__controls narrative__controls-left',
                  !shouldEnableBack && 'is-disabled'
                ])}
                aria-label={backLabel}
                aria-disabled={!shouldEnableBack || null}
                onClick={onNavigationClicked}
              >
                <span className="icon" aria-hidden="true" />
              </button>

              <div className="narrative__indicators">
                {_items.map(({ _index, _isVisited, _isActive }) =>

                  <div className={classes([
                    'narrative__progress',
                    _isVisited && 'is-visited',
                    _isActive && 'is-selected'
                  ])}
                  data-index={_index}
                  key={_index}
                  />

                )}
              </div>

              <button
                data-direction="right"
                className={classes([
                  'btn-icon narrative__controls narrative__controls-right',
                  !shouldEnableNext && 'is-disabled'
                ])}
                aria-label={nextLabel}
                aria-disabled={!shouldEnableNext || null}
                onClick={onNavigationClicked}
              >
                <span className="icon" aria-hidden="true" />
              </button>

            </div>

          </div>
        </div>

        <div className="narrative__strapline">

          <div className="narrative__strapline-header">
            <div
              className="narrative__strapline-header-inner u-clearfix"
              style={{
                width: `${_totalWidth}%`,
                transform: `translateX(${_translateXOffset}%)`
              }}
            >

              {_items.map(({ _index, _isActive, _isVisited, strapline }) =>

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
                      dangerouslySetInnerHTML={{ __html: compile(strapline, props) }}
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
            aria-label={backLabel}
            aria-disabled={!shouldEnableBack || null}
            onClick={onNavigationClicked}
          >
            <span className="icon" aria-hidden="true" />
          </button>

          <button
            data-direction="right"
            className={classes([
              'btn-icon narrative__controls narrative__controls-right',
              !shouldEnableNext && 'is-disabled'
            ])}
            aria-label={nextLabel}
            aria-disabled={!shouldEnableNext || null}
            onClick={onNavigationClicked}
          >
            <span className="icon" aria-hidden="true" />
          </button>

        </div>

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
            />
          )}

        </div>

      </div>

    </div>
  );
}
