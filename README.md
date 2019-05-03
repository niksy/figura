# figura

[![Build Status][ci-img]][ci]
[![BrowserStack Status][browserstack-img]][browserstack]

View component for markup you already have.

Features:

-   Basic state and props setting and implicit rendering
-   Subview managment: adding, getting and removing

Inspired by:

-   Event handling from [Backbone.View][backbone-view]
-   State and props management from [React][react] and [Preact][preact]

**[Try it now!](https://codesandbox.io/s/64v426r9nw?expanddevtools=1&fontsize=14)**

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
import Figura from 'figura';

class Shelby extends Figura {
	static el = '#shelby';
	static childrenEl = {
		sasha: '#sasha'
	};
	static events = {
		'click .lilly': 'clickMethod'
	};
	clickMethod() {
		// .lilly clicked!
	}
}

class Sasha extends Shelby {
	static el = '#sasha';
	static childrenEl = {
		...Shelby.childrenEl,
		honey: '.honey'
	};
	clickMethod() {
		// .lilly clicked, with overriden method on `Sasha`.
	}
}

const shelby = new Shelby();

// `roxie` won’t have any child elements and won’t have any event listeners since it doesn’t have any children nodes
const roxie = new Sasha({
	el: '.roxie'
});
```

Using state and props. All render specifics can be contained inside `render`
method.

```js
import Figura from 'figura';

class Shelby extends Figura {
	static el = '#shelby';
	static defaultProps = {
		text: 'shelby'
	};
	constructor(props) {
		super(props);
		this.render(); // Initial render only with props
		this.setState({
			jackie: 42,
			romeo: '42'
		});
		const state = this.state;
		state.jackie; // => 42 as number
	}
	render(key, value) {
		if (typeof key === 'undefined') {
			this.$el.innerHTML = `Initial content is ${this.props.text}.`; // Initial content is shelby.
		}
		if (key === 'romeo') {
			this.$el.innerHTML = `Value is ${value}.`; // Value is 42.
		}
		return this;
	}
}
```

Render placeholder and view assign usage.

```js
import Figura from 'figura';

class Shelby extends Figura {
	static el = '#shelby';
	template() {
		// Template function result
	}
	constructor(props) {
		super(props);
		this.addSubview(new Figura(), 'customKey');
	}
	render() {
		this.$el.innerHTML = this.template({
			customKeyComponent: this.getSubview(
				'customKey'
			).getRenderPlaceholder()
		});
		this.assignSubview('customKey');
		return this;
	}
}
```

## API

Every property except `el`, `childrenEl` and `events` will be merged with
`defaultProps` and added to `this.props`.

#### el

Type: `(string|HTMLElement)`  
Default: ``

Element on which should view be created.

#### childrenEl

Type: `Object`  
Default: `{}`

List of children elements, mapped to DOM nodes based on CSS selector.

To handle common use case of selecting only one element, if result contains only
one element, only that element is returned, otherwise array of elements is
returned.

If you want to return array of elements regardless of resulting count, append
`[]` to list key.

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

Type: `function`  
Default: `{}`

Default values for props to ensure that `this.props` property has value if it
hasn’t been passed when creating view instance.

<!-- prettier-ignore-start -->

#### $(selector, returnAllNodes)

<!-- prettier-ignore-end -->

Type: `function`  
Returns: `(HTMLElement|HTMLElement[])`

Finds all descendants of `$el` filtered by CSS selector.

| Property         | Type      | Default | Description                                                                                                                                                                                                        |
| ---------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `selector`       | `string`  | N/A     | Standard CSS selector.                                                                                                                                                                                             |
| `returnAllNodes` | `boolean` | `false` | Always return array of elements. By default, if result contains only one element only that element is returned, if result doesn’t contain any element `null` is returned, otherwise array of elements is returned. |

#### render(key, value)

Type: `function`  
Returns: `Figura`

Render view. Takes into account state modifications if you use state—every time
state is modified `render` is called with key which is changed and current
state. In this instance, state is combination of previous and new state.

| Property | Type     | Description                                                    |
| -------- | -------- | -------------------------------------------------------------- |
| `key`    | `string` | Current state key that should be handled in `render`.          |
| `value`  | `*`      | Value of current state key that should be handled in `render`. |

#### remove

Type: `function`

Remove view, but not root DOM element—use [`removeElement`](#removeelement) for
that.

#### setElement(element)

Type: `function`

Sets or re-sets current UI element.

##### element

Type: `String|Element`

#### removeElement

Type: `function`

Remove view DOM element.

#### cacheChildrenEl(elements)

Type: `function`

Caches children elements.

##### elements

Type: `Object`

See [`childrenEl`](#childrenel).

#### delegateEvents(events)

Type: `function`

Delegates events.

##### events

Type: `Object`

See [`events`](#events).

#### undelegateEvents

Type: `function`

Undelegates events.

#### delegate(eventName, selector, listener)

Type: `function`

Delegate single event.

##### eventName

Type: `string`

##### selector

Type: `string`

##### listener

Type: `function`

#### undelegate(eventName, selector, listener)

Type: `function`

Undelegate single event. For argument definition, see
[`delegate`](#delegateeventname-selector-listener).

#### setState(data)

Type: `function`

Set state for instance. Runs synchronously, so if one piece of state depends on
other (e.g. one key depends on another key), run multiple `setState` calls with
different keys.

#### addSubview(view, key)

Adds subview to current view.

##### view

Type: `Figura`

Subview to add to current view.

##### key

Type: `(string|number)`

Subview key so it can be easily identified in subview collection. If undefined,
view’s `uid` property will be used.

#### getSubview(key)

Gets subview referenced by key.

##### key

Type: `(string|number)`

Key which is used to reference subview.

#### removeSubviews

Removes all subviews from current view.

#### getRenderPlaceholder

Returns view’s placeholder element which will be used in resolving for
`assignSubview`.

#### assignSubview(key)

Replaces view’s render placeholder with real content. Real content should be
rendered inside subview `render` method.

##### key

Type: `(string|number)`

Key which is used to reference subview.

#### addSideEffect(...args)

Add side effect. See [`manageSideEffects.add`][manage-side-effects-add]
documentation.

#### removeSideEffect(...args)

Remove side effect. See [`manageSideEffects.remove`][manage-side-effects-remove]
documentation. Every registered side effect is removed on `remove` method call.

## FAQ

**Running `setState` on multiple keys which depend on each other in that call
doesn’t render changes properly.**

`setState` runs synchronously, so if one piece of state depends on other (e.g.
one key depends on another key in current `setState` call), run multiple
`setState` calls.

For example, if `romeo` and `layla` values depend on each other in current
`setState` call:

```js
// Instead of this
this.setState({
	romeo: 'gigi',
	layla: 'buddy'
});

// Use this
this.setState({
	romeo: 'gigi'
});
this.setState({
	layla: 'buddy'
});
```

## Test

For local automated tests, run `npm run test:automated:local`.

## Browser support

Tested in IE9+ and all modern browsers. For [IE <= 10
support][babel-ie10-support], you will have to [polyfill
`__proto__`][proto-polyfill] if you use class extending.

For [static class properties][proposal-class-fields], you need to use [Babel
plugin][babel-plugin-proposal-class-properties], otherwise set properties
explictly on class.

```js
import Figura from 'figura';

// With static class properties
class Shelby extends Figura {
	static el = '';
}

// Without static class properties
class Shelby extends Figura {}
Shelby.el = '';
```

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

<!-- prettier-ignore-start -->

[ci]: https://travis-ci.com/niksy/figura
[ci-img]: https://travis-ci.com/niksy/figura.svg?branch=master
[backbone-view]: https://backbonejs.org/#View
[react]: https://reactjs.org/
[preact]: https://preactjs.com/
[babel-ie10-support]: https://babeljs.io/docs/en/caveats/#classes-10-and-below
[proto-polyfill]: https://github.com/webcarrot/proto-polyfill
[proposal-class-fields]: https://github.com/tc39/proposal-class-fields
[babel-plugin-proposal-class-properties]: https://babeljs.io/docs/en/babel-plugin-proposal-class-properties
[manage-side-effects-add]: https://github.com/niksy/manage-side-effects#instanceaddsideeffect-id
[manage-side-effects-remove]: https://github.com/niksy/manage-side-effects#instanceremoveid
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://www.browserstack.com/automate/badge.svg?badge_key=Q0ZXeVQzQU5pdDJLOUVHTWNtTWdhM3pHTGdiZ0lZMzU5VDhpOWhpYmNyRT0tLWtWVStVZUJmNXV4TUlucnJ4MWZXTVE9PQ==--000033e0b3d995123228f4139bca45946653f237

<!-- prettier-ignore-end -->
