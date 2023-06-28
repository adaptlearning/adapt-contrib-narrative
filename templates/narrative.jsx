import React from 'react';
import a11y from 'core/js/a11y';
import MODE from '../js/modeEnum';
import { templates, compile, classes } from 'core/js/reactHelpers';

export default function Narrative(props) {

  const {
    _id,
    _items,
    _hasNavigationInTextArea,
    onNavigationClicked,
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
                aria-disabled={!shouldEnableBack || null}
                onClick={onNavigationClicked}
              >
                <span className="aria-label" dangerouslySetInnerHTML={{ __html: backLabel }} />
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
                aria-disabled={!shouldEnableNext || null}
                onClick={onNavigationClicked}
              >
                <span className="aria-label" dangerouslySetInnerHTML={{ __html: nextLabel }} />
                <span className="icon" aria-hidden="true" />
              </button>

            </div>

          </div>
        </div>

        <templates.narrativeStrapline {...props} />

        <templates.narrativeSlideContainer {...props} />

        <templates.narrativeIndicators {...props} />

      </div>

    </div>
  );
}
