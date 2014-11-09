# kist-segment

Simple UI view setup. Inspired by [Backbone.View](http://backbonejs.org/#View) and [simple inheritance by John Resig](http://ejohn.org/blog/simple-javascript-inheritance/).

## Installation

```sh
bower install niksy/kist-segment
```

## API

### `segment(options)`

#### Static methods

##### _super

Type: `Object`

Parent object prototype.

##### extend(options)

Type: `Function`

Extend segment.

###### options

Type: `Object`

##### supply(prop, props)

Type: `Function`  
Returns `Object`

Returns new object with property value from parent prototype and new properties.

###### prop

Type: `String`

###### props

Type: `Object`

#### Options

##### el

Type: `String|jQuery|Function`

UI element on which should segment be initialized.

##### childrenEl

Type: `Object`

List of `el` children elements.

Example:

```js
// Input
{
	'child1': '.child1',
	'child2': $('.child2'),
	'child3': function () {
		return '.child3';
	}
}

// Output
this.$child1 = this.$el.find('.child1');
this.$child2 = this.$el.find($('.child2'));
this.$child3 = this.$el.find('.child3');
```

##### events

Type: `Object`

List of `el` events, delegated to children elements.

Example:

```js
// Input
{
	'click .child1': 'method1',
	'submit .child2': 'method2',
	'mouseenter|mouseleave .child3': 'method3',
	'mouseenter .child4': function () {
		// Do something
	}
}
```

##### $(selector)

Type: `Function`  
Returns: `jQuery`

Alias for `this.$el.find(selector)`.

###### selector

Type: `String|jQuery`

String is standard CSS selector.

##### init(options)

Type: `Function`

Initialization method (similar to construct).

###### options

Type: `Object`

##### setOptions(options)

Type: `Function`

Set instance options. It will set everything except `el`, `childrenEl` and `events`.

###### options

Type: `Object`

##### render

Type: `Function`
Returns: `Segment`

Render method.

##### remove

Type: `Function`

Remove segment.

##### setElement(element)

Type: `Function`

Sets or re-sets current UI element.

###### element

Type: `String|jQuery`

String is standard CSS selector.

##### cacheChildrenEl(options)

Type: `Function`

Caches children elements.

###### options

Type: `Object`

See [`childrenEl`](#childrenel).

##### delegateEvents(events)

Type: `Function`

Delegates events.

###### events

Type: `Object`

See [`events`](#events).

##### undelegateEvents

Type: `Function`

Undelegates events.

##### delegate(eventName, selector, listener)

Type: `Function`

Delegate single event.

###### eventName

Type: `String`

###### selector

Type: `String`

###### listener

Type: `Function`

##### undelegate(eventName, selector, listener)

Type: `Function`

Undelegate single event. For argument definition, see [`delegate`](#delegateeventname-selector-listener).

## Examples

```js
var Segment1 = $.kist.segment.extend({
	el: 'html',
	childrenEl: {
		'body': 'body'
	},
	events: {
		'click .testElement': 'testClick'
	},
	init: function ( options ) {
		console.log('Initialized.');
		this.setOptions(options);
		console.log(this.options);
	},
	testClick: function () {
		console.log('.testElement clicked!');
	}
});

var Segment2 = Segment1.extend({
	el: 'body',
	childrenEl: Segment1.supply('childrenEl', {
		'div': 'div'
	}),
	testClick: function () {
		console.log('.testElement clicked, with overriden method on `Bar`.');
	}
});

var segment1 = new Segment1();
var segment2 = new Segment2();
var segment3 = new Segment3({
	el: 'div'
});
```

## Browser support

Tested in IE8+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)
