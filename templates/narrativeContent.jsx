import React from 'react';
import a11y from 'core/js/a11y';
import { templates, compile, classes } from 'core/js/reactHelpers';

export default function Narrative(props) {

  const {
    _id,
    _items,
    _isLargeMode,
    _isStackedOnMobile
  } = props;

  return (
    <div className="narrative__content">
      <div className="narrative__content-inner">

        {_items.map(({ _index, _isActive, _isVisited, title, body, _graphic }) =>

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

            {(_graphic && _isStackedOnMobile && !_isLargeMode) &&
              <div className="narrative__content-image">
                <templates.image {..._graphic}
                  classNamePrefixes={['narrative__slider-image js-narrative-swipe']}
                  attributionClassNamePrefixes={['component', 'narrative']}
                  draggable="false"
                />
              </div>
            }

            {title &&
            <div className="narrative__content-title">
              <div
                className="narrative__content-title-inner"
                role="heading"
                aria-level={a11y.ariaLevel({ id: _id, level: 'componentItem' })}
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

        <templates.narrativeControls {...props} />

      </div>
    </div>
  );
}
