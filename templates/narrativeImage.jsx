import React from 'react';
import a11y from 'core/js/a11y';

export default function NarrativeImage(_graphic) {

  return (
    <>
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
    </>
  );
}
