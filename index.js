import delegate from 'delegate-event-listener';
import manageSideEffects from 'manage-side-effects';
import scopedQuerySelectorAll from 'scoped-queryselectorall';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const childNameSplitter = /^(.*?)(\[\])?$/;
const viewProps = ['el', 'events', 'childrenEl'];
let instanceCount = 0;

const hasOwnProp = Object.prototype.hasOwnProperty;

/**
 * @param  {string} eventName
 *
 * @return {string}
 */
function resolveEventName(eventName) {
	switch (eventName) {
		case 'focus':
			return 'focusin';
		case 'blur':
			return 'focusout';
		default:
			return eventName;
	}
}

class Figura {
	static el = '';

	static events = {};

	static childrenEl = {};

	static defaultProps = {};

	constructor(props = {}) {
		this.uid = instanceCount++;
		this._subviews = {};
		this._delegatedEvents = {};
		this.state = {};
		this.props = {};
		this._sideEffects = manageSideEffects();

		const { el, events, childrenEl } = this._getResolvedViewProps(props);

		this._setProps(props);

		this.setElement(el);
		this.delegateEvents(events);
		this.cacheChildrenEl(childrenEl);
	}

	/**
	 * @param {(string|HTMLElement)} el
	 */
	setElement(el = '') {
		if (typeof el === 'string' && el !== '') {
			this.$el = document.querySelector(el);
		} else if (el instanceof Element) {
			this.$el = el;
		} else {
			this.$el = null;
		}
	}

	removeElement() {
		if (this.$el && this.$el.parentNode !== null) {
			this.$el.parentNode.removeChild(this.$el);
		}
	}

	/**
	 * @param  {*} selector
	 * @param  {boolean} returnNodesArray
	 *
	 * @returns {(HTMLElement|HTMLElement[])}
	 */
	$(selector, returnNodesArray = false) {
		const nodes = [].slice.call(scopedQuerySelectorAll(selector, this.$el));
		if (!returnNodesArray) {
			if (nodes.length === 0) {
				return null;
			}
			if (nodes.length === 1) {
				return nodes[0];
			}
		}
		return nodes;
	}

	/**
	 * @param {Object} data
	 */
	setState(data = {}) {
		const newState = Object.entries(data).reduce(
			(obj, [key, value]) => ({
				...obj,
				[key]: value
			}),
			{}
		);

		const state = {
			...this.state,
			...newState
		};

		this.state = state;

		Object.keys(newState).forEach((key) => {
			this.render(key, state[key]);
		});
	}

	/**
	 * @param {Object} data
	 */
	_setProps(data = {}) {
		const omitted = Object.entries(data)
			.filter(([key]) => viewProps.indexOf(key) === -1)
			.reduce(
				(obj, [key, value]) => ({
					...obj,
					[key]: value
				}),
				{}
			);

		const ctor = Object.getPrototypeOf(this).constructor;
		const { defaultProps } = ctor;

		this.props = {
			...defaultProps,
			...omitted
		};
	}

	/**
	 * @param  {Object} data
	 *
	 * @returns {Object}
	 */
	_getResolvedViewProps(data = {}) {
		const ctor = Object.getPrototypeOf(this).constructor;

		return viewProps.reduce(
			(obj, viewProp) => ({
				...obj,
				[viewProp]: viewProp in data ? data[viewProp] : ctor[viewProp]
			}),
			{}
		);
	}

	/**
	 * @param  {Object} childrenEl
	 */
	cacheChildrenEl(childrenEl = {}) {
		if (!this.$el) {
			return;
		}

		Object.entries(childrenEl).forEach(([childName, selector]) => {
			const [, resolvedChildName, returnNodesArray] = childName.match(
				childNameSplitter
			);
			this[`$${resolvedChildName}`] = this.$(
				selector,
				Boolean(returnNodesArray)
			);
		});
	}

	/**
	 * @param  {Object} events
	 */
	delegateEvents(events = {}) {
		this.undelegateEvents();

		if (!this.$el) {
			return;
		}

		Object.entries(events).forEach(([eventSelector, method]) => {
			const resolvedMethod =
				typeof method !== 'function' ? this[method] : method;
			if (resolvedMethod) {
				const [, eventName, selector] = eventSelector.match(
					delegateEventSplitter
				);
				this.delegate(eventName, selector, resolvedMethod.bind(this));
			}
		});
	}

	undelegateEvents() {
		if (!this.$el) {
			return;
		}
		Object.entries(this._delegatedEvents).forEach(
			([eventSelector, method]) => {
				const [, eventName, selector] = eventSelector.match(
					delegateEventSplitter
				);
				this.undelegate(eventName, selector, method.delegatedEvent);
			}
		);
	}

	/**
	 * @param  {string} eventName
	 * @param  {string} selector
	 * @param  {Function} listener
	 */
	delegate(eventName, selector, listener) {
		const handlerKey = `${eventName} ${selector}`.trim();
		const handler = this._delegatedEvents[handlerKey];
		const originalEvent = listener;
		const delegatedEvent =
			selector === '' ? listener : delegate(selector, listener);

		if (typeof handler === 'undefined') {
			this._delegatedEvents[handlerKey] = {
				originalEvent: originalEvent,
				delegatedEvent: delegatedEvent
			};
			this.$el.addEventListener(
				resolveEventName(eventName),
				delegatedEvent,
				false
			);
		}
	}

	/**
	 * @param  {string} eventName
	 * @param  {string} selector
	 * @param  {Function} listener
	 */
	undelegate(eventName, selector, listener) {
		const handlerKey = `${eventName} ${selector}`.trim();
		const handler = this._delegatedEvents[handlerKey];
		const originalEvent = handler.originalEvent;
		const delegatedEvent = handler.delegatedEvent;

		if (originalEvent === listener || delegatedEvent === listener) {
			delete this._delegatedEvents[handlerKey];
			this.$el.removeEventListener(
				resolveEventName(eventName),
				delegatedEvent,
				false
			);
		}
	}

	/**
	 * @param {...*} args
	 */
	addSideEffect(...args) {
		this._sideEffects.add(...args);
	}

	/**
	 * @param  {...*} args
	 */
	removeSideEffect(...args) {
		this._sideEffects.remove(...args);
	}

	/**
	 * Returns subview by supplied key.
	 *
	 * @param  {(string|number)} key
	 *
	 * @returns {Figura}
	 */
	getSubview(key) {
		return this._subviews[key];
	}

	/**
	 * Adds a subview to the current view, which will
	 * ensure its removal when this view is removed,
	 * or when view.removeSubviews is called.
	 *
	 * @param {Figura} view
	 * @param {(string|number)} key
	 *
	 * @returns {Figura}
	 */
	addSubview(view, key) {
		if (!(view instanceof Figura)) {
			throw new TypeError('Subview must be instance of Figura');
		}
		if (typeof key === 'undefined') {
			key = view.uid;
		}
		this._subviews[key] = view;
		return view;
	}

	/**
	 * Removes any subviews associated with this view
	 * by `addSubview`, which will in-turn remove any
	 * children of those views, and so on.
	 *
	 * @returns {Figura}
	 */
	removeSubviews() {
		for (let key in this._subviews) {
			if (hasOwnProp.call(this._subviews, key)) {
				const subview = this._subviews[key];
				if (typeof subview.remove === 'function') {
					subview.remove();
				}
				delete this._subviews[key];
			}
		}

		return this;
	}

	/**
	 * Get subview placeholder.
	 *
	 * @returns {string}
	 */
	getRenderPlaceholder() {
		return `<div data-view-uid="${this.uid}"></div>`;
	}

	/**
	 * Replace subview placeholder with its real content.
	 *
	 * @param  {(string|number)} key
	 */
	assignSubview(key) {
		const view = this.getSubview(key);
		const node = this.$(`[data-view-uid="${view.uid}"]`);
		const replacementNode = view.render().$el;
		if (node) {
			node.parentNode.replaceChild(replacementNode, node);
		}
	}

	/**
	 * @param  {string} key
	 * @param  {*} value
	 *
	 * @returns {Figura}
	 */
	render(key, value) {
		return this;
	}

	remove() {
		this.undelegateEvents();

		if (typeof this._subviews !== 'undefined') {
			this.removeSubviews();
			delete this._subviews;
		}

		if (typeof this._sideEffects !== 'undefined') {
			this._sideEffects.removeAll();
			delete this._sideEffects;
		}

		// Delete children element references
		for (let key in this) {
			if (hasOwnProp.call(this, key)) {
				if (/^\$/.test(key)) {
					delete this[key];
				}
			}
		}
	}
}

export default Figura;
