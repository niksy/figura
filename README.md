# figura

[![Build Status][ci-img]][ci] [![BrowserStack Status][browserstack-img]][browserstack]

View component for markup you already have. Inspired by [Backbone.View][backbone-view].

Features:

* Subview managment: adding, getting and removing
* Basic state setting and implicit rendering
* [Optional DOM diff support for rendering][dom-diff-explanation]

## Install

```sh
npm install figura --save
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
import View from 'figura';

class Shelby extends View {
	get el () {
		return '#shelby';
	}
	get childrenEl () {
		return {
			sasha: '#sasha'
		};
	}
	get events () {
		return {
			'click .lilly': 'clickMethod'
		};
	}
	constructor ( options ) {
		super(options);
		this.setOptions(options);
		this.addSubview(new View());
		this.addSubview(new View(), 'customKey');
	}
	getCustomKeyView () {
		return this.getSubview('customKey');
	}
	clickMethod () {
		console.log('.lilly clicked!');
	}
}

class Sasha extends Shelby {
	get el () {
		return '#sasha';
	}
	get childrenEl () {
		return {
			...super.childrenEl,
			honey: '.honey'
		};
	}
	clickMethod () {
		console.log('.lilly clicked, with overriden method on `Sasha`.');
	}
}

const shelby = new Shelby();
const sasha = new Sasha();
const roxie = new Sasha({
	el: '.roxie'
});
```

Render placeholder and view assign usage.

```js
import View from 'figura';

class Shelby extends View {
	get el () {
		return '#shelby';
	}
	template () {
		// Your template function result
	}
	constructor ( options ) {
		super(options);
		this.addSubview(new View(), 'customKey');
	}
	render () {
		this.$el.innerHTML = this.template({
			customKeyComponent: this.getSubview('customKey').getRenderPlaceholder()
		});
		this.assignSubview('customKey');
		return this;
	}
}
```

Using state.

```js
import View from 'figura';

class Sasha extends View {
	get el () {
		return '#sasha';
	}
	constructor ( options ) {
		super(options);
		this.setState({
			jackie: 42,
			romeo: '42'
		});
		const state = this.state;
		console.log(state.jackie); // => 42
	}
	stateValueModifier ( key, value ) {
		if ( key === 'romeo' ) {
			return parseInt(value, 10);
		}
		return value;
	}
	render ( key, state ) {
		if ( key === 'romeo' ) {
			this.$el.innerHTML = `romeo value is ${state.romeo}.`;
		}
		return this;
	}
}
```

<a name="dom-diff-variant"></a>DOM diff variant usage.

```js
import { DOMDiff } from 'figura';

class Shelby extends DOMDiff {
	get el () {
		return '#shelby';
	}
	template ( data ) {
		return `<span class="honey">${data.count}</span>`;
	}
	render () {
		this.renderDiff(this.template({
			count: 42 
		}));
		return this;
	}
}
```

## API

#### el

Type: `String|Element`

Element on which should view be created.

#### childrenEl

Type: `Object`

List of children elements.

Input like this:

```js
{
	'shelby': '.shelby',
	'sasha': '.sasha'
}
```

#### events

Type: `Object`

List of events, delegated to children elements.

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

#### $(selector)

Type: `Function`  
Returns: `NodeList`

Finds all descendants of `$el` filtered by selector.

##### selector

Type: `String`

Standard CSS selector.

#### setOptions(options)

Type: `Function`

Set instance options. It will set everything except `el`, `childrenEl` and `events`.

##### options

Type: `Object`

#### render(key, state)

Type: `Function`
Returns: `View`

Render view. Takes into account state modifications if you use state—every time state is modified `render` is called with key which is changed and current state.

#### remove

Type: `Function`

Remove view.

#### setElement(element)

Type: `Function`

Sets or re-sets current UI element.

##### element

Type: `String|Element`

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
`render` method).

If you’re using `renderDiff` for content rendering, and view is instance of
[DOM diff implementation][dom-diff-variant], explicit
call for this method in parent view is unecessary—it will be called for every
subview which rendered it’s placeholder with `getRenderPlaceholder`.

#### key

Type: `String|Number`

Key which is used to reference subview.

#### setState(data)

Type: `Function`

Set state for instance.

#### stateValueModifier(key, value)

Type: `Function`
Returns: `Mixed`

Modify state value before setting new state.

##### key

Type: `String`

State key for which value will be modified.

##### value

Type: `Mixed`

State value to modify.

## DOM diff

Optionally you can use [`dom-diff`][dom-diff] implementation of this module 
to achieve performant rendering of your content. The difference in applying 
template content is very subtle—instead of applying new content to DOM element
directly, you use convenient `renderDiff` method.

### renderDiff(content, cb)

Renders [DOM diff][dom-diff] to current view’s element.

#### content

Type: `String`

Content which should be diffed with current element and will be used to patch it. It should be valid HTML string.

#### cb

Type: `Function`

Called after current view’s element is updated by using
[morphdom’s `onElUpdated` hook][morphdom-api]. In most cases you won’t need
to use this callback, but it can be useful if DOM tree which needs to be
processed is large and you need to handle subview rendering after processing or
additional DOM manipulation.

### fromTemplate

Type: `Boolean`

Should this view be fully constructed from template. Useful when you want to
completely hold view representation inside template files (default view
behavior is to have root element outside template).

## Test

For local automated tests, run `npm run test:automated:local`.

## Browser support

Tested in IE9+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.org/niksy/figura
[ci-img]: https://travis-ci.org/niksy/figura.svg?branch=master
[dom-diff-explanation]: #dom-diff
[dom-diff]: https://github.com/patrick-steele-idem/morphdom
[dom-diff-variant]: #dom-diff-variant
[morphdom-api]: https://github.com/patrick-steele-idem/morphdom#morphdomfromnode-tonode-options--node
[backbone-view]: http://backbonejs.org/#View
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://www.browserstack.com/automate/badge.svg?badge_key=Q0ZXeVQzQU5pdDJLOUVHTWNtTWdhM3pHTGdiZ0lZMzU5VDhpOWhpYmNyRT0tLWtWVStVZUJmNXV4TUlucnJ4MWZXTVE9PQ==--000033e0b3d995123228f4139bca45946653f237
