# adapt-contrib-narrative

**Narrative** is a *presentation component* bundled with the [Adapt framework](https://github.com/adaptlearning/adapt_framework).

<img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/narrative01.gif" alt="narrative in action">

**Narrative** displays items (or slides) that present an image and text side-by-side. Left and right navigation controls allow the learner to progress horizontally through the items. Optional text may precede it. Useful for detailing a sequential process. On mobile devices, the narrative text is collapsed above the image.

[Visit the **Narrative** wiki](https://github.com/adaptlearning/adapt-contrib-narrative/wiki) for more information about its functionality and for explanations of key properties.

## Installation

As one of Adapt's *[core components](https://github.com/adaptlearning/adapt_framework/wiki/Core-Plug-ins-in-the-Adapt-Learning-Framework#components),* **Narrative** is included with the [installation of the Adapt framework](https://github.com/adaptlearning/adapt_framework/wiki/Manual-installation-of-the-Adapt-framework#installation) and the [installation of the Adapt authoring tool](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-Adapt-Origin).

* If **Narrative** has been uninstalled from the Adapt framework, it may be reinstalled.
With the [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run the following from the command line:
  ```console
  adapt install adapt-contrib-narrative
  ```
  Alternatively, this component can also be installed by adding the following line of code to the *adapt.json* file:
  ```json
  "adapt-contrib-narrative": "*"
  ```
  Then running the command:
  ```console
  adapt install
  ```
  (This second method will reinstall all plug-ins listed in *adapt.json*.)

* If **Narrative** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).
<div float align=right><a href="#top">Back to Top</a></div>

## Settings Overview

The attributes listed below are used in *components.json* to configure **Narrative**, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-narrative/blob/master/example.json). Visit the [**Narrative** wiki](https://github.com/adaptlearning/adapt-contrib-narrative/wiki) for more information about how they appear in the [authoring tool](https://github.com/adaptlearning/adapt_authoring/wiki).

### Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

**\_component** (string): This value must be: `narrative`.

**\_classes** (string): CSS class name to be applied to **Narrative**’s containing div. The class must be predefined in one of the Less files. Separate multiple classes with a space. `items-are-full-width` increases the width of the narrative elements to 100% in desktop view.

**\_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`; however, `full` is typically the only option used as `left` or `right` do not allow much room for the component to display.

**instruction** (string): This optional text appears above the component. It is frequently used to guide the learner’s interaction with the component.

**mobileInstruction** (string): This is optional instruction text that will be shown when viewed on mobile. It may be used to guide the learner’s interaction with the component.

**\_isTextBelowImage** (boolean): If enabled, the text area drops below the image instead of being beside it.

**\_isMobileTextBelowImage** (boolean): If enabled, on mobile, the text area drops below the image instead of being behind the strapline button.

**\_hasNavigationInTextArea** (boolean): Determines the location of the arrows (icons) used to navigate from slide to slide. Navigation can overlay the image or the text. Set to `true` to have the navigation controls appear in the text region.

**\_setCompletionOn** (string): This value determines when the component registers as complete. Acceptable values are `"allItems"` and `"inview"`. `"allItems"` requires the learner to navigate to each slide. `"inview"` requires the **Narrative** component to enter the view port completely, top and bottom.

**\_items** (array): Multiple items may be created. Each item represents one slide and contains values for the narrative (**title**, **body**), the image (**\_graphic**), and the slide's header when viewed on a mobile device (**\_strapLine**).

>**title** (string): This value is the title for this narrative element.

>**body** (string): This is the main text for this narrative element.

>**\_graphic** (object): The image that appears next to the narrative text. It contains values for **src**, **alt**, and **attribution**.

>>**src** (string): File name (including path) of the image. Path should be relative to the *src* folder (e.g.,*course/en/images/origami-menu-two.jpg*).

>>**alt** (string): The alternative text for this image. Assign [alt text](https://github.com/adaptlearning/adapt_framework/wiki/Providing-good-alt-text) to images that convey course content only.

>>**attribution** (string): Optional text to be displayed as an [attribution](https://wiki.creativecommons.org/Best_practices_for_attribution). By default it is displayed below the image. Adjust positioning by modifying CSS. Text can contain HTML tags, e.g., `Copyright © 2015 by <b>Lukasz 'Severiaan' Grela</b>`.

>**strapline** (string): This text is displayed as a title above the image when `device.screenSize` is `small` (i.e., when viewed on mobile devices).

### Accessibility
**Narrative** has been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **ariaRegion**. This label is not a visible element. It is utilized by assistive technology such as screen readers. Should the region's text need to be customised, it can be found within the **globals** object in [*properties.schema*](https://github.com/adaptlearning/adapt-contrib-narrative/blob/master/properties.schema).
<div float align=right><a href="#top">Back to Top</a></div>

## Limitations

On mobile devices, the narrative text is collapsed above the image. It is accessed by clicking an icon (+) next the to strapline.

----------------------------
**Version number:**  7.0.0   <a href="https://community.adaptlearning.org/" target="_blank"><img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/adapt-logo-mrgn-lft.jpg" alt="adapt learning logo" align="right"></a><br>
**Framework versions:** 5.19.1+<br>
**Author / maintainer:** Adapt Core Team with [contributors](https://github.com/adaptlearning/adapt-contrib-narrative/graphs/contributors)<br>
**Accessibility support:** WAI AA<br>
**RTL support:** Yes<br>
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), Edge, IE11, Safari 14 for macOS/iOS/iPadOS, Opera
