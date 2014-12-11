# kist-view

Simple UI view. Inspired by [Backbone.View](http://backbonejs.org/#View).

## Installation

```sh
npm install kist-view --save

bower install kist-view --save
```

## API

View extends [`kist-klass`](https://github.com/niksy/kist-klass) so it receives all it’s default properties. API usage for those properties is explanied on project page.

The only difference is list of properties and methods `extend` method can receive.

### `.extend(options)`

#### init(options)

Type: `Function`

Initialization method which will should run after `constructor` method.

#### el

Type: `String|jQuery|Function`

UI element on which should view be initialized.

#### childrenEl

Type: `Object`

List of `el` children elements.

Input like this:

```js
{
	'child1': '.child1',
	'child2': $('.child2'),
	'child3': function () {
		return '.child3';
	}
}
```

Translates to output like this:

```js
this.$child1 = this.$el.find('.child1');
this.$child2 = this.$el.find($('.child2'));
this.$child3 = this.$el.find('.child3');
```

#### events

Type: `Object`

List of `el` events, delegated to children elements.

Input like this:

```js
{
	'click .child1': 'method1',
	'submit .child2': 'method2',
	'mouseenter|mouseleave .child3': 'method3',
	'mouseenter .child4': function () {
		// Do something
	}
}
```

Translates to output like this:

```js
this.$el.on('click', '.child1', $.proxy(this.method1, this));
this.$el.on('submit', '.child2', $.proxy(this.method2, this));
this.$el.on('mouseenter mouseleave', '.child3', $.proxy(this.method3, this));
this.$el.on('mouseenter', '.child4', $.proxy(function () {
	// Do something
}, this));
```

#### $(selector)

Type: `Function`  
Returns: `jQuery`

Alias for `this.$el.find(selector)`.

##### selector

Type: `String|jQuery`

`String` is standard CSS selector.

#### setOptions(options)

Type: `Function`

Set instance options. It will set everything except `el`, `childrenEl` and `events`.

##### options

Type: `Object`

#### render

Type: `Function`
Returns: `View`

Render method.

#### remove

Type: `Function`

Remove view.

#### setElement(element)

Type: `Function`

Sets or re-sets current UI element.

##### element

Type: `String|jQuery`

`String` is standard CSS selector.

#### cacheChildrenEl(options)

Type: `Function`

Caches children elements.

##### options

Type: `Object`

See [`childrenEl`](#childrenel).

#### delegateEvents(events)

Type: `Function`

Delegates events.

##### events

Type: `Object`

See [`events`](#events).

#### undelegateEvents

Type: `Function`

Undelegates events.

#### delegate(eventName, selector, listener)

Type: `Function`

Delegate single event.

##### eventName

Type: `String`

##### selector

Type: `String`

##### listener

Type: `Function`

#### undelegate(eventName, selector, listener)

Type: `Function`

Undelegate single event. For argument definition, see [`delegate`](#delegateeventname-selector-listener).

## Examples

```js
var View = require('kist-view');

var View1 = View.extend({
	el: 'html',
	childrenEl: {
		'body': 'body'
	},
	events: {
		'click .foo': 'testClick'
	},
	init: function ( options ) {
		console.log('Initialized.');
		this.setOptions(options);
		console.log(this.options);
	},
	testClick: function () {
		console.log('.foo clicked!');
	}
});

var View2 = View1.extend({
	el: 'body',
	childrenEl: $.extend({}, View1.prototype.childrenEl, {
		'bar': '.bar'
	}),
	testClick: function () {
		console.log('.foo clicked, with overriden method on `Bar`.');
	}
});

var view1 = new View1();
var view2 = new View2();
var view3 = new View2({
	el: '.baz'
});
```

### AMD and global

```js
define(['kist-view'], cb);

window.$.kist.view;
```

## Browser support

Tested in IE8+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)
