#adapt-contrib-narrative

An Adapt core contributed narrative component that displays images with corresponding text and left and right navigation controls to progress through the narrative.

The narrative control renders differently when Adapt.device.screenSize is 'small'.  In this case the corresponding body text is only available by clicking the '+' icon.

##Installation

First, be sure to install the [Adapt Command Line Interface](https://github.com/adaptlearning/adapt-cli), then from the command line run:-

        adapt install adapt-contrib-narrative

This component can also be installed by adding the component to the adapt.json file before running `adapt install`:

        "adapt-contrib-narrative": "*"

##Usage

Once installed, the component can be used to create a narrative control comprised of one or more graphic components and associated text and a means of navigating between them.

##Settings overview

For example JSON format, see [example.json](https://github.com/adaptlearning/adapt-contrib-narrative/blob/master/example.json). A description of the core settings can be found at: [Core model attributes](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

Further settings for this component are:

####_component

This value must be: `narrative`

####_classes

You can use this setting to add custom classes to your template and LESS file.

####_layout

This defines the position of the component in the block. Values can be `full`, `left` or `right`. 


####_items

Each item represents one narrative slide and contains values for `text`, `_shouldBeSelected` and `_graphic`.


####title

This value is the title for this narrative element. This is mandatory, but will not be displayed.

####displayTitle

This value is the displayed title for this narrative element. This is optional and will be displayed.

####body

This is the main text for this narrative element.

####_graphic

The image for this narrative element is defined within this element. This element should contain only one value for `src`, `alt`, `title` and `strapline`.

####src

Enter a path to the image. Paths should be relative to the src folder, e.g.

course/en/images/image-slider-1.jpg

####alt

A value for images alternative text can be entered here.

####title

This setting is for the title attribute on the image.

####strapline

A strapline should be entered. This is displayed when Adapt.device.screenSize is 'small' and is shown as a title above the image.

##Limitations
 
To be completed.

##Browser spec

This component has been tested to the standard Adapt browser specification.
