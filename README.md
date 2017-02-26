# kist-view

[![Build Status][ci-img]][ci]

Simple UI view. Inspired by [Backbone.View](http://backbonejs.org/#View).

## Install

```sh
npm install kist-view --save
```

## Usage

```html
<div id="shelby">
	<span id="sasha">
		<button type="button" class="lilly">Lilly button</button>
		<span class="honey">Honey content</span>
	</span>
	<i class="roxie">Roxie content</i>
</div>
```

```js
const View = require('kist-view');

const Shelby = View.extend({
	el: '#shelby',
	childrenEl: {
		sasha: '#sasha'
	},
	events: {
		'click .lilly': 'clickMethod'
	},
	initialize: function ( options ) {
		this.setOptions(options);
	},
	clickMethod: function () {
		console.log('.lilly clicked!');
	}
});

var Sasha = Shelby.extend({
	el: '#sasha',
	childrenEl: $.extend({}, Shelby.prototype.childrenEl, {
		honey: '.honey'
	}),
	clickMethod: function () {
		console.log('.lilly clicked, with overriden method on `Sasha`.');
	}
});

const shelby = new Shelby();
const sasha = new Sasha();
const roxie = new Sasha({
	el: '.roxie'
});
```

## API

### View.extend(options)

Returns: `Object`

View extends [`kist-klass`](https://github.com/niksy/kist-klass) so it receives all it’s default properties. API usage for those properties is explanied on project page.

The only difference is list of properties and methods `extend` method can receive.

#### initialize(options)

Type: `Function`

Initialization method which will should run after `constructor` method.

#### el

Type: `String|jQuery`

UI element on which should view be initialized.

#### childrenEl

Type: `Object`

List of `el` children elements.

Input like this:

```js
{
	'shelby': '.shelby',
	'sasha': '.sasha'
}
```

Translates to output like this:

```js
this.$shelby = this.$el.find('.shelby');
this.$sasha = this.$el.find('.sasha');
```

#### events

Type: `Object`

List of `el` events, delegated to children elements.

Input like this:

```js
{
	'click .shelby': 'method1',
	'submit .sasha': 'method2',
	'mouseleave .lilly': 'method3',
	'mouseenter .child4': function () {
		// Do something
	}
}
```

Translates to output like this:

```js
this.$el.on('click' + this.ens, '.shelby', method1.bind(this));
this.$el.on('submit' + this.ens, '.sasha', this.method2.bind(this));
this.$el.on('mouseleave' + this.ens, '.lilly', this.method3.bind(this));
this.$el.on('mouseenter' + this.ens, '.child4', function () {
	// Do something
}.bind(this));
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

## Test

For local automated tests, run `npm run test:automated:local`.

## Browser support

Tested in IE9+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.org/niksy/kist-view
[ci-img]: https://travis-ci.org/niksy/kist-view.svg?branch=master
