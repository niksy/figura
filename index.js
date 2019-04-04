import delegate from 'delegate-event-listener';
import scopedQuerySelectorAll from 'scoped-queryselectorall';

const delegateEventSplitter = /^(\S+)\s*(.*)$/;
const childNameSplitter = /^(.*?)(\[\])?$/;
const viewProps = ['el', 'events', 'childrenEl'];
let instanceCount = 0;

const hasOwnProp = Object.prototype.hasOwnProperty;

class Figura {

	static el = ''

	static events = {}

	static childrenEl = {}

	static defaultProps = {}

	constructor ( props = {} ) {

		this.uid = instanceCount++;
		this.subviews = {};
		this.delegatedEvents = {};
		this.state = {};
		this.props = {};

		const {
			el,
			events,
			childrenEl
		} = this._getResolvedViewProps(props);

		this._setProps(props);

		this.setElement(el);
		this.delegateEvents(events);
		this.cacheChildrenEl(childrenEl);

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

	removeElement () {

		if ( this.$el && this.$el.parentNode !== null ) {
			this.$el.parentNode.removeChild(this.$el);
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
				[key]: value
			}), {});

		const state = {
			...this.state,
			...newState
		};

		this.state = state;

		Object.keys(newState)
			.forEach(( key ) => {
				this.render(key, state[key], { state: state, props: this.props });
			});

	}

	/**
	 * @param {Object} data
	 */
	_setProps ( data = {} ) {

		const omitted = Object.entries(data)
			.filter(([ key ]) => viewProps.indexOf(key) === -1)
			.reduce(( obj, [ key, value ] ) => ({
				...obj,
				[key]: value
			}), {});

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
	 * @return {Object}
	 */
	_getResolvedViewProps ( data = {} ) {

		const ctor = Object.getPrototypeOf(this).constructor;

		return viewProps.reduce(( obj, viewProp ) => ({
			...obj,
			[viewProp]: viewProp in data ? data[viewProp] : ctor[viewProp]
		}), {});

	}

	/**
	 * @param  {String} key
	 * @param  {*} value
	 * @param  {Object} storage
	 * @param  {Object} storage.state
	 * @param  {Object} storage.props
	 *
	 * @return {Figura}
	 */
	render ( key, value, { state = this.state, props = this.props } = { state: this.state, props: this.props } ) {
		return this;
	}

	remove () {

		this.undelegateEvents();

		this.removeSubviews();
		delete this.subviews;

		// Delete children element references
		for ( let key in this ) {
			if ( hasOwnProp.call(this, key) ) {
				if ( /^\$/.test(key) ) {
					delete this[key];
				}
			}
		}

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
	 * @return {Figura}
	 */
	getSubview ( key ) {
		return this.subviews[key];
	}

	/**
	 * Adds a subview to the current view, which will
	 * ensure its removal when this view is removed,
	 * or when view.removeSubviews is called
	 *
	 * @param {Figura} view
	 * @param {String|Number} key
	 *
	 * @return {Figura}
	 */
	addSubview ( view, key ) {
		if ( !(view instanceof Figura) ) {
			throw new TypeError('Subview must be instance of Figura');
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
	 * @return {Figura}
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
		const node = this.$(`[data-view-uid="${view.uid}"]`);
		const replacementNode = view.render().$el;
		if ( node ) {
			node.parentNode.replaceChild(replacementNode, node);
		}
	}

};

export default Figura;
