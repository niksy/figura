import delegate from 'delegate-event-listener';
import scopedQuerySelectorAll from 'scoped-queryselectorall';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const viewOptions = ['el', 'events', 'childrenEl'];
let instanceCount = 0;

const hasOwnProp = Object.prototype.hasOwnProperty;

class View {

	get el () {
		const { _el = '' } = this;
		return _el;
	}

	set el ( value = '' ) {
		this._el = value;
	}

	get events () {
		const { _events = {} } = this;
		return _events;
	}

	set events ( value = {} ) {
		this._events = value;
	}

	get childrenEl () {
		const { _childrenEl = {} } = this;
		return _childrenEl;
	}

	set childrenEl ( value = {} ) {
		this._childrenEl = value;
	}

	get options () {
		const { _options = {} } = this;
		return _options;
	}

	set options ( value = {} ) {
		this._options = value;
	}

	constructor ( options = {} ) {

		this.uid = instanceCount++;
		this.subviews = {};
		this.delegatedEvents = {};
		this.state = {};

		viewOptions.forEach(( viewOption ) => {
			if ( viewOption in options ) {
				this[viewOption] = options[viewOption];
			}
		});

		this.undelegateEvents();
		this.setElement(this.el);
		this.delegateEvents(this.events);
		this.cacheChildrenEl(this.childrenEl);

	}

	/**
	 * @param {String|Element} el
	 */
	setElement ( el = '' ) {
		if ( typeof el === 'string' ) {
			this.$el = document.querySelector(el);
		} else {
			this.$el = el;
		}
	}

	/**
	 * @param  {Mixed} selector
	 *
	 * @return {NodeList}
	 */
	$ ( selector ) {
		return scopedQuerySelectorAll(selector, this.$el);
	}

	/**
	 * @param {Object} data
	 */
	setState ( data = {} ) {

		const newState = Object.entries(data)
			.reduce(( obj, [ key, value ] ) => {
				const modifiedValue = this.stateValueModifier(key, value);
				return {
					...obj,
					[key]: modifiedValue
				};
			}, {});

		const state = {
			...this.state,
			...newState
		};

		this.state = state;

		Object.keys(newState)
			.forEach(( key ) => {
				this.render(key, state);
			});

	}

	/**
	 * @param  {String} key
	 * @param  {Mixed} value
	 *
	 * @return {Mixed}
	 */
	stateValueModifier ( key, value ) {
		return value;
	}

	/**
	 * @param  {String} key
	 * @param  {Object} state
	 *
	 * @return {View}
	 */
	render ( key, state = this.state ) {
		return this;
	}

	remove () {

		this.removeSubviews();
		delete this.subviews;

		if ( this.$el && this.$el.parentNode !== null ) {
			this.$el.parentNode.removeChild(this.$el);
		}
		delete this.el;
		delete this.events;
		delete this.childrenEl;

	}

	/**
	 * @param {Object} options
	 */
	setOptions ( options = {} ) {

		const omitted = Object.keys(options)
			.filter(( key ) => viewOptions.indexOf(key) === -1)
			.reduce(( obj, key ) => ({ ...obj, [key]: options[key] }), {});

		this.options = {
			...this.options,
			...omitted
		};

	}

	/**
	 * @param  {Object} childrenEl
	 */
	cacheChildrenEl ( childrenEl = {} ) {

		if ( !this.$el ) {
			return;
		}

		Object.keys(childrenEl)
			.forEach(( key ) => {
				const selector = this.$(childrenEl[key]);
				this[`$${key}`] = selector;
			});

	}

	/**
	 * @param  {Object} events
	 */
	delegateEvents ( events = {} ) {

		this.undelegateEvents();

		if ( !this.$el ) {
			return;
		}

		Object.keys(events)
			.forEach(( key ) => {
				let method = events[key];
				if ( typeof method !== 'function' ) {
					method = this[method];
				}
				if ( method ) {
					const match = key.match(delegateEventSplitter);
					this.delegate(match[1], match[2], method.bind(this));
				}
			});

	}

	undelegateEvents () {
		if ( !this.$el ) {
			return;
		}
		Object.keys(this.delegatedEvents)
			.forEach(( handlerKey ) => {
				const match = handlerKey.match(delegateEventSplitter);
				this.undelegate(match[1], match[2], this.delegatedEvents[handlerKey].delegatedEvent);
			});
	}

	/**
	 * @param  {String} eventName
	 * @param  {String} selector
	 * @param  {Function} listener
	 */
	delegate ( eventName, selector, listener ) {

		const handlerKey = `${eventName} ${selector}`;
		const handler = this.delegatedEvents[handlerKey];
		const originalEvent = listener;
		const delegatedEvent = delegate(selector, listener);

		if ( typeof handler === 'undefined' ) {
			this.delegatedEvents[handlerKey] = {
				originalEvent: originalEvent,
				delegatedEvent: delegatedEvent
			};
			this.$el.addEventListener(eventName, delegatedEvent, false);
		}

	}

	/**
	 * @param  {String} eventName
	 * @param  {String} selector
	 * @param  {Function} listener
	 */
	undelegate ( eventName, selector, listener ) {

		const handlerKey = `${eventName} ${selector}`;
		const handler = this.delegatedEvents[handlerKey];
		const originalEvent = handler.originalEvent;
		const delegatedEvent = handler.delegatedEvent;

		if ( originalEvent === listener || delegatedEvent === listener ) {
			delete this.delegatedEvents[handlerKey];
			this.$el.removeEventListener(eventName, delegatedEvent, false);
		}

	}

	/**
	 * Returns subview by supplied key
	 *
	 * @param  {String|Number} key
	 *
	 * @return {View}
	 */
	getSubview ( key ) {
		return this.subviews[key];
	}

	/**
	 * Adds a subview to the current view, which will
	 * ensure its removal when this view is removed,
	 * or when view.removeSubviews is called
	 *
	 * @param {View} view
	 * @param {String|Number} key
	 *
	 * @return {View}
	 */
	addSubview ( view, key ) {
		if ( !(view instanceof View) ) {
			throw new TypeError('Subview must be a View');
		}
		if ( typeof key === 'undefined' ) {
			key = view.uid;
		}
		this.subviews[key] = view;
		return view;
	}

	/**
	 * Removes any subviews associated with this view
	 * by `addSubview`, which will in-turn remove any
	 * children of those views, and so on
	 *
	 * @return {View}
	 */
	removeSubviews () {

		for ( let key in this.subviews ) {
			if ( hasOwnProp.call(this.subviews, key) ) {
				const subview = this.subviews[key];
				if ( typeof subview.remove === 'function' ) {
					subview.remove();
				}
				delete this.subviews[key];
			}
		}

		return this;

	}

	/**
	 * Get subview placeholder
	 *
	 * @return {String}
	 */
	getRenderPlaceholder () {
		return `<div data-view-uid="${this.uid}"></div>`;
	}

	/**
	 * Replace subview placeholder with its real content
	 *
	 * @param  {String|Number} key
	 */
	assignSubview ( key ) {
		const view = this.getSubview(key);
		const node = this.$(`[data-view-uid="${view.uid}"]`)[0];
		const replacementNode = view.render().$el;
		if ( node ) {
			node.parentNode.replaceChild(replacementNode, node);
		}
	}

};

export default View;
