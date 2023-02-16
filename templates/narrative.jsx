import Adapt from 'core/js/adapt';
import React from 'react';
import { templates, classes } from 'core/js/reactHelpers';

export default function Narrative(props) {

  const ariaLabels = Adapt.course.get('_globals')?._accessibility?._ariaLabels;

  const {
    _items,
    _hasNavigationInTextArea,
    _totalWidth
  } = props;

  return (
    <div className='component__inner narrative__inner'>

      <templates.header {...props} />

      <div className={classes([
        'component__widget narrative__widget',
        _hasNavigationInTextArea && 'narrative__text-controls'
      ])}>

        <div className="narrative__content">
          <div className="narrative__content-inner">

            {_items.map(({ _index, _isVisited, title, body }) =>

              <div
                className={classes([
                  'narrative__content-item',
                  _isVisited && 'is-visited'
                ])}
                data-index={_index}
                key={_index}>

                {title &&
                <div className="narrative__content-title">
                  <div
                    className="narrative__content-title-inner"
                    role="heading"
                    aria-level="{{a11y_aria_level @root/_id 'componentItem' _ariaLevel}}"
                    dangerouslySetInnerHTML={{ __html: title }} />
                </div>
                }

                {body &&
                <div className="narrative__content-body">
                  <div
                    className="narrative__content-body-inner"
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                </div>
                }

              </div>

            )}

            <div className="narrative__controls-container u-clearfix">

              <button
                data-direction="left"
                className="btn-icon narrative__controls narrative__controls-left js-narrative-controls-click"
                aria-label={ariaLabels.previous}
              >
                <span className="icon" aria-hidden="true" />
              </button>

              <div className="narrative__indicators">
                {_items.map(({ _index, _isVisited }) =>

                  <div className={classes([
                    'narrative__progress js-narrative-progress-click',
                    _isVisited && 'is-visited'
                  ])}
                  data-index={_index}
                  key={_index}
                  />

                )}
              </div>

              <button
                data-direction="right"
                className="btn-icon narrative__controls narrative__controls-right js-narrative-controls-click"
                aria-label={ariaLabels.next}
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
              style={{ width: _totalWidth + '%' }}
            >

              {_items.map(({ _index, _isVisited, strapline, _itemWidth }) =>

                <button
                  className={classes([
                    'narrative__strapline-btn js-narrative-strapline-open-popup',
                    _isVisited && 'is-visited'
                  ])}
                  aria-label={strapline}
                  style={{ width: _itemWidth + '%' }}
                  data-index={_index}
                  key={_index}
                >

                  <span className="narrative__strapline-title">
                    <span
                      className="narrative__strapline-title-inner"
                      dangerouslySetInnerHTML={{ __html: strapline }}
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
            style={{ width: _totalWidth + '%' }}
          >

            {_items.map(({ _index, _isVisited, _graphic, _itemWidth }) =>

              <div
                className={classes([
                  'narrative__slider-image-container',
                  _isVisited && 'is-visited',
                  _graphic.attribution && 'has-attribution'
                ])}
                style={{ width: _itemWidth + '%' }}
                data-index={_index}
                key={_index}
              >

                <img
                  className="narrative__slider-image js-narrative-swipe"
                  src={_graphic.src}
                  aria-label={_graphic.alt || null}
                  aria-hidden={!_graphic.alt || null}
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
            className="btn-icon narrative__controls narrative__controls-left js-narrative-controls-click"
            aria-label={ariaLabels.previous}
          >
            <span className="icon" aria-hidden="true" />
          </button>

          <button
            data-direction="right"
            className="btn-icon narrative__controls narrative__controls-right js-narrative-controls-click"
            aria-label={ariaLabels.next}
          >
            <span className="icon" aria-hidden="true" />
          </button>

        </div>

        <div className="narrative__indicators narrative__slide-indicators">

          {_items.map(({ _index, _isVisited }) =>
            <div
              className={classes([
                'narrative__progress js-narrative-progress-click',
                _isVisited && 'is-visited'
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
