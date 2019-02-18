import delegate from 'delegate-event-listener';
import scopedQuerySelectorAll from 'scoped-queryselectorall';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const childNameSplitter = /^(.*?)(\[\])?$/;
const viewProps = ['el', 'events', 'childrenEl'];
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

	get props () {
		const { _props = {} } = this;
		return _props;
	}

	set props ( value = {} ) {
		this._props = value;
	}

	constructor ( props = {} ) {

		this.uid = instanceCount++;
		this.subviews = {};
		this.delegatedEvents = {};
		this.state = {};
		this.props = {};

		this._resolveProps(props);

		this.undelegateEvents();
		this.setElement(this.el);
		this.delegateEvents(this.events);
		this.cacheChildrenEl(this.childrenEl);

	}

	/**
	 * @param {String|Element} el
	 */
	setElement ( el = '' ) {
		if ( typeof el === 'string' && el !== '' ) {
			this.$el = document.querySelector(el);
		} else if ( el instanceof Element ) {
			this.$el = el;
		} else {
			this.$el = null;
		}
	}

	/**
	 * @param  {Mixed} selector
	 * @param  {Boolean} returnNodesArray
	 *
	 * @return {Element|Element[]}
	 */
	$ ( selector, returnNodesArray = false ) {
		const nodes =  [].slice.call(scopedQuerySelectorAll(selector, this.$el));
		if ( !returnNodesArray && nodes.length === 1 ) {
			return nodes[0];
		}
		return nodes;
	}

	/**
	 * @param {Object} data
	 */
	setState ( data = {} ) {

		const newState = Object.entries(data)
			.reduce(( obj, [ key, value ] ) => ({
				...obj,
				[key]: this.valueModifier(key, value)
			}), {});

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
	 * @param {Object} data
	 */
	_resolveProps ( data = {} ) {

		// Set view props
		viewProps.forEach(( viewProp ) => {
			if ( viewProp in data ) {
				this[viewProp] = data[viewProp];
			}
		});

		// Set props ommitting view props
		const omitted = Object.entries(data)
			.filter(([ key ]) => viewProps.indexOf(key) === -1)
			.reduce(( obj, [ key, value ] ) => ({
				...obj,
				[key]: this.valueModifier(key, value)
			}), {});

		this.props = {
			...this.props,
			...omitted
		};

	}

	/**
	 * @param  {String} key
	 * @param  {Mixed} value
	 *
	 * @return {Mixed}
	 */
	valueModifier ( key, value ) {
		return value;
	}

	/**
	 * @param  {String} key
	 * @param  {Object} state
	 * @param  {Object} props
	 *
	 * @return {View}
	 */
	render ( key, state = this.state, props = this.props ) {
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
	 * @param  {Object} childrenEl
	 */
	cacheChildrenEl ( childrenEl = {} ) {

		if ( !this.$el ) {
			return;
		}

		Object.entries(childrenEl)
			.forEach(([ childName, selector ]) => {
				const [ , resolvedChildName, returnNodesArray ] = childName.match(childNameSplitter);
				this[`$${resolvedChildName}`] = this.$(selector, Boolean(returnNodesArray));
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

		Object.entries(events)
			.forEach(([ eventSelector, method ]) => {
				const resolvedMethod = typeof method !== 'function' ? this[method] : method;
				if ( resolvedMethod ) {
					const [ , eventName, selector ] = eventSelector.match(delegateEventSplitter);
					this.delegate(eventName, selector, resolvedMethod.bind(this));
				}
			});

	}

	undelegateEvents () {
		if ( !this.$el ) {
			return;
		}
		Object.entries(this.delegatedEvents)
			.forEach(([ eventSelector, method ]) => {
				const [ , eventName, selector ] = eventSelector.match(delegateEventSplitter);
				this.undelegate(eventName, selector, method.delegatedEvent);
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
