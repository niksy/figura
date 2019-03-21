# figura

[![Build Status][ci-img]][ci] [![BrowserStack Status][browserstack-img]][browserstack]

View component for markup you already have. Inspired by [Backbone.View][backbone-view], [React][react] and [Preact][preact].

Features:

* Basic state and props setting and implicit rendering
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
	static el = '#shelby'
	static childrenEl = {
		sasha: '#sasha'
	}
	static events = {
		'click .lilly': 'clickMethod'
	}
	clickMethod () {
		// .lilly clicked!
	}
}

class Sasha extends Shelby {
	static el = '#sasha'
	static childrenEl = {
		...Shelby.childrenEl,
		honey: '.honey'
	}
	clickMethod () {
		// .lilly clicked, with overriden method on `Sasha`.
	}
}

const shelby = new Shelby();

// `roxie` won’t have any child elements and won’t have any event listeners since it doesn’t have any children nodes
const roxie = new Sasha({
	el: '.roxie'
});
```

Using state and props. All render specifics can be contained inside `render` method.

```js
import View from 'figura';

class Shelby extends View {
	static el = '#shelby'
	static defaultProps = {
		text: 'shelby'
	}
	constructor ( props ) {
		super(props);
		this.render(); // Initial render only with props
		this.setState({
			jackie: 42,
			romeo: '42'
		});
		const state = this.state;
		state.jackie; // => 42 as number
	}
	stateValueModifier ( key, value ) {
		if ( key === 'romeo' ) {
			return parseInt(value, 10); // '42' (string) will be parsed to 42 (number)
		}
		return value;
	}
	render ( key, state, props ) {
		if ( typeof key === 'undefined' ) {
			this.$el.innerHTML = `Initial content is ${props.text}.`; // Initial content is shelby.
		}
		if ( key === 'romeo' ) {
			this.$el.innerHTML = `Value is ${state.romeo}.`; // Value is 42.
		}
		return this;
	}
}
```

Render placeholder and view assign usage.

```js
import View from 'figura';

class Shelby extends View {
	static el = '#shelby'
	template () {
		// Template function result
	}
	constructor ( props ) {
		super(props);
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
Default: ``

Element on which should view be created.

#### childrenEl

Type: `Object`  
Default: `{}`

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
Default: `{}`

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

#### defaultProps

Type: `Function`  
Default: `() => ({})`

Default props.

#### $(selector, returnAllNodes)

Type: `Function`  
Returns: `Element|Element[]`

Finds all descendants of `$el` filtered by CSS selector.

##### selector

Type: `String`

Standard CSS selector.

##### returnAllNodes

Type: `Boolean`  
Default: `false`

Always return array of elements. By default, if result contains only one element, only that element is returned, otherwise array of elements is returned.

#### render(key, state, props)

Type: `Function`
Returns: `View`

Render view. Takes into account state modifications if you use state—every time state is modified `render` is called with key which is changed and current state.

##### key

Type: 'String'

Current state key that should be handled in `render`.

##### state

Type: 'Object'  
Default: `{}`

Current state.

##### props

Type: 'Object'  
Default: `{}`

Props with which this view has been initialized (except `el`, `childrenEl` and `events`).

#### remove

Type: `Function`

Remove view, but not root DOM element—use [`removeElement`](#removeelement) for that.

#### setElement(element)

Type: `Function`

Sets or re-sets current UI element.

##### element

Type: `String|Element`

#### removeElement

Type: `Function`

Remove view DOM element.

#### cacheChildrenEl(elements)

Type: `Function`

Caches children elements.

##### elements

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

#### propValueModifier(key, value)

Type: `Function`
Returns: `Mixed`

Modify Prop value before setting prop.

##### key

Type: `String`

Prop key for which value will be modified.

##### value

Type: `Mixed`

Prop value to modify.

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

For [static class properties](https://github.com/tc39/proposal-class-fields), you need to use [Babel plugin](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties), otherwise set properties explictly on class.

```js
// With static class properties
class View {
	static el = ''
}

// Without static class properties
class View {}
View.el = '';
```

If you need [IE <= 10 support](https://babeljs.io/docs/en/caveats/#classes-10-and-below), you will have to [polyfill `__proto__`](https://github.com/webcarrot/proto-polyfill) if you use class extending.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.com/niksy/figura
[ci-img]: https://travis-ci.com/niksy/figura.svg?branch=master
[backbone-view]: https://backbonejs.org/#View
[react]: https://reactjs.org/
[preact]: https://preactjs.com/
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://www.browserstack.com/automate/badge.svg?badge_key=Q0ZXeVQzQU5pdDJLOUVHTWNtTWdhM3pHTGdiZ0lZMzU5VDhpOWhpYmNyRT0tLWtWVStVZUJmNXV4TUlucnJ4MWZXTVE9PQ==--000033e0b3d995123228f4139bca45946653f237
