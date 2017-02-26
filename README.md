# kist-view

[![Build Status][ci-img]][ci]

Simple UI view. Inspired by [Backbone.View][backbone-view].

Features:

* Subview managment: adding, getting and removing
* [Optional Virtual DOM support for rendering][virtual-dom-explanation]

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
		this.addSubview(new View());
		this.addSubview(new View(), 'customKey');
	},
	getCustomKeyView: function () {
		return this.getSubview('customKey');
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

Render placeholder and view assign usage.

```js
const View = require('kist-view');

const Shelby = View.extend({
	el: '#shelby',
	initialize: function () {
		this.addSubview(new View(), 'customKey');
	},
	render: function () {
		this.$el.html(this.template({
			customKeyComponent: this.getSubview('customKey').getRenderPlaceholder()
		}));
		this.assignSubview('customKey');
		return this;
	}
});
```

Virtual DOM variant usage.

```js
const View = require('kist-view/dist/virtual-dom');

const Shelby = View.extend({
	el: '#shelby',
	template: function ( data ) {
		return `<span class="honey">${data.count}</span>`;
	},
	render: function () {
		this.renderDiff(this.template({
			count: 42 
		}));
		return this;
	}
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

### addSubview(view, key)

Adds subview to current view.

#### view

Type: `View`

Subview to add to current view.

#### key

Type: `String|Number`

Subview key so it can be easily identified in subview collection. If undefined, 
view’s `uid` property will be used.

### getSubview(key)

Gets subview referenced by key.

#### key

Type: `String|Number`

Key which is used to reference subview.

### removeSubviews

Removes all subviews from current view.

### getRenderPlaceholder

Returns view’s placeholder element which will be used in resolving for
`assignSubview`.

### assignSubview(key)

Replaces view’s render placeholder with real content (returned when running
`render` method). If you’re using `renderDiff` for content rendering, explicit
call for this method is unecessary—it will be called for every subview which
rendered it’s placeholder with `getRenderPlaceholder`.

#### key

Type: `String|Number`

Key which is used to reference subview.

### renderDiff(content)

Renders [`virtual-dom`][virtual-dom] patches to current view’s element. Available 
only as part of [virtual-dom variant of this module][virtual-dom-variant].

#### content

Type: `String|Number|Element|jQuery`

Content which should be diffed with current element and will be used to patch it.

### fromTemplate

Type: `Boolean`

Should this view be fully constructed from template. Useful when you want to
completely hold view representation inside template files (default view
behavior is to have root element outside template).

Available only for Virtual DOM implementation.

## Virtual DOM

Optionally you can use [`virtual-dom`][virtual-dom] implementation of this module 
to achieve performant rendering of your content. The difference in applying 
template content is very subtle—instead of applying new content to DOM element
directly, you use convenient `renderDiff` method.

## Test

For local automated tests, run `npm run test:automated:local`.

## Browser support

Tested in IE9+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.org/niksy/kist-view
[ci-img]: https://travis-ci.org/niksy/kist-view.svg?branch=master
[virtual-dom-explanation]: #virtual-dom
[virtual-dom]: https://github.com/Matt-Esch/virtual-dom
[virtual-dom-variant]: https://github.com/niksy/kist-backbone-view/blob/master/virtual-dom.js
[backbone-view]: http://backbonejs.org/#View
