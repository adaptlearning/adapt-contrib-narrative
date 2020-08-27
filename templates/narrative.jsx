import Adapt from 'core/js/adapt';
import { templates, classes, html, compile } from 'core/js/reactHelpers';

export default function(model, view) {
  const data = model.toJSON();
  const ariaLabels = Adapt.course.get('_globals')._accessibility._ariaLabels;

  return (
    <div className='component__inner mcq__inner'>

      {templates.component(model, view)}

      <div className={classes([
        'component__widget',
        'narrative__widget',
        view._hasNavigationInTextArea && 'narrative__text-controls'
      ])}>

        <div className='narrative__content'>
          <div className='narrative__content-inner'>

            {data._items.map(({ _isVisited, title, body, _graphic }, index) =>
              <div
                className={classes([
                  'narrative__content-item',
                  _isVisited && 'is-visited'
                ])}
                data-index={index}
                key={index}
              >

                {title &&
                <div className='narrative__content-title'>
                  <div
                    className='narrative__content-title-inner'
                    // {Adapt.a11y.attrs.heading('componentItem')}
                  >
                    {html(title)}
                  </div>
                </div>
                }

                {_graphic.alt && Adapt.a11y.normalize(_graphic.alt)}

                {body &&
                <div className='narrative__content-body'>
                  <div className='narrative__content-body-inner'>
                    {html(compile(body))}
                  </div>
                </div>
                }

              </div>
            )}

            <div className='narrative__controls-container u-clearfix'>
              <button
                className='btn-icon narrative__controls narrative__controls-left js-narrative-controls-click'
                data-direction='left'
                aria-label={ariaLabels.previous}
              >
                <div className='icon'></div>
              </button>

              <div className='narrative__indicators'>

                {data._items.map(({ _isVisited }, index) =>
                  <div
                    className={classes([
                      'narrative__progress',
                      'js-narrative-progress-click',
                      _isVisited && 'is-visited'
                    ])}
                    data-index={index}
                    key={index}
                  >
                  </div>
                )}

              </div>

              <button
                className='btn-icon narrative__controls narrative__controls-right js-narrative-controls-click'
                data-direction='right'
                aria-label={ariaLabels.next}
              >
                <div className='icon'></div>
              </button>
            </div>

          </div>
        </div>

        <div className='narrative__strapline'>

          <div className='narrative__strapline-header'>
            <div
              className='narrative__strapline-header-inner u-clearfix'
              style={{width: `${data._totalWidth}%`}}
            >

              {data._items.map(({ _isVisited, strapline }, index) => 
                <button
                  className={classes([
                    'narrative__strapline-btn',
                    'js-narrative-strapline-open-popup',
                    _isVisited && 'is-visited'
                  ])}
                  aria-label={strapline}
                  style={{width: `${data._itemWidth}%`}}
                  data-index={index}
                  key={index}
                >

                  <div className='narrative__strapline-title'>
                    <div className='narrative__strapline-title-inner'>
                      {html(compile(strapline))}
                    </div>
                  </div>

                  <div className='btn-icon narrative__strapline-icon'>
                    <div className='icon'></div>
                  </div>

                  <div className='focus-rect'></div>

                </button>
              )}

            </div>
          </div>
        </div>

        <div className='narrative__slide-container'>

          <button
            className='btn-icon narrative__controls narrative__controls-left js-narrative-controls-click'
            data-direction='left'
            aria-label={ariaLabels.previous}
          >
            <div className='icon'></div>
          </button>

          <button
            className='btn-icon narrative__controls narrative__controls-right js-narrative-controls-click'
            data-direction='right'
            aria-label={ariaLabels.next}
          >
            <div className='icon'></div>
          </button>

          <div
            className='narrative__slider u-clearfix'
            style={{width: `${data._totalWidth}%`}}
          >

            {data._items.map(({ _isVisited, _graphic}, index) =>
              <div
                className={classes([
                  'narrative__slider-image-container',
                  _isVisited && 'is-visited',
                  _graphic.attribution && 'has-attribution'
                ])}
                style={{width: `${data._itemWidth}%`}}
                data-index={index}
                key={index}
              >

                <img
                  className='narrative__slider-image'
                  src={_graphic.src}
                  aria-hidden={true}
                />

                {_graphic.attribution &&
                <div className='component__attribution narrative__attribution'>
                  <div className='component__attribution-inner narrative__attribution-inner'>
                    {html(compile(_graphic.attribution))}
                  </div>
                </div>
                }
              </div>
            )}

          </div>

        </div>

        <div className='narrative__indicators narrative__slide-indicators'>

          {data._items.map(({ _isVisited}, index) =>
            <div className={classes([
              'narrative__progress js-narrative-progress-click',
              _isVisited && 'is-visited'
            ])}
            data-index={index}
            key={index}
            ></div>
          )}

        </div>

      </div>
    </div>
  );
}
