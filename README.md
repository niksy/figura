# figura

[![Build Status][ci-img]][ci] [![BrowserStack Status][browserstack-img]][browserstack]

View component for markup you already have. Inspired by [Backbone.View][backbone-view].

Features:

* Basic state setting and implicit rendering
* Subview managment: adding, getting and removing

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

Using state. **Prefer using state for render purposes** because you can contain all render specifics inside `render` method.

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
			this.$el.innerHTML = `romeo value is ${state.romeo}.`; // `state.romeo` is number instead of string
		}
		return this;
	}
}
```

Render placeholder and view assign usage.

```js
import View from 'figura';

class Shelby extends View {
	get el () {
		return '#shelby';
	}
	template () {
		// Template function result
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

## API

#### el

Type: `String|Element`

Element on which should view be created.

#### childrenEl

Type: `Object`

List of children elements, mapped to DOM nodes based on CSS selector.

To handle common use case of selecting only one element, if result contains only one element, only that element is returned, otherwise array of elements is returned.

If you want to return array of elements regardless of resulting count, append `[]` to list key.

```js
{
	'shelby': '.shelby', // this.$shelby = this.$('.shelby'); - Returns either one or array of elements, based on resulting count
	'sasha': '.sasha' // this.$sasha = this.$('.sasha'); - Returns either one or array of elements, based on resulting count
	'rudy[]': '.rudy' // this.$rudy = this.$('.rudy'); - Always returns array of elements
}
```

#### events

Type: `Object`

List of events, delegated to children elements.

```js
{
	'click .shelby': 'method1', // Delegated click event to `.shelby` calling instance method `method1`
	'submit .sasha': 'method2', // Delegated submit event to `.sasha` calling instance method `method2`
	'mouseleave .lilly': 'method3', // Delegated mouseleave event to `.lilly` calling instance method `method3`
	'mouseenter .rudy': ( e ) {  // Delegated mouseenter event to `.rudy` calling anonymous function
		// Do something
	}
}
```

#### $(selector)

Type: `Function`  
Returns: `NodeList`

Finds all descendants of `$el` filtered by CSS selector.

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

#### setState(data)

Type: `Function`

Set state for instance. Runs synchronously, so if one piece of state depends on other (e.g. one key depends on another key), run multiple `setState` calls with different keys.

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

#### addSubview(view, key)

Adds subview to current view.

##### view

Type: `View`

Subview to add to current view.

##### key

Type: `String|Number`

Subview key so it can be easily identified in subview collection. If undefined, 
view’s `uid` property will be used.

#### getSubview(key)

Gets subview referenced by key.

##### key

Type: `String|Number`

Key which is used to reference subview.

#### removeSubviews

Removes all subviews from current view.

#### getRenderPlaceholder

Returns view’s placeholder element which will be used in resolving for
`assignSubview`.

#### assignSubview(key)

Replaces view’s render placeholder with real content. Real content should be rendered
inside subview `render` method.

##### key

Type: `String|Number`

Key which is used to reference subview.

## Test

For local automated tests, run `npm run test:automated:local`.

## Browser support

Tested in IE9+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.com/niksy/figura
[ci-img]: https://travis-ci.com/niksy/figura.svg?branch=master
[morphdom-api]: https://github.com/patrick-steele-idem/morphdom#morphdomfromnode-tonode-options--node
[backbone-view]: http://backbonejs.org/#View
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://www.browserstack.com/automate/badge.svg?badge_key=Q0ZXeVQzQU5pdDJLOUVHTWNtTWdhM3pHTGdiZ0lZMzU5VDhpOWhpYmNyRT0tLWtWVStVZUJmNXV4TUlucnJ4MWZXTVE9PQ==--000033e0b3d995123228f4139bca45946653f237
