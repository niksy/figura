/*! kist-segment 0.0.0 - Simple UI view setup. | Author: Ivan Nikolić, 2014 | License: MIT */
;(function ( $, window, document, undefined ) {
	/* jshint latedef:false */

	var plugin = {
		name: 'segment',
		ns: {
			event: '.kist.segment'
		}
	};

	var instanceCount = 0;
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;
	var eventListSplitter = /([^\|\s]+)/g;
	var segmentOptions = ['el','events','childrenEl'];
	var staticProps = {
		extend: extend,
		supply: supply
	};

	/**
	 * If `prop` is string, it is supposed to be property on current context
	 * prototype. Otherwise, it is used verbatim or as object if falsy.
	 *
	 * @param  {Mixed} prop
	 * @param  {Object} props
	 *
	 * @return {Object}
	 */
	function supply ( prop, props ) {
		if ( typeof(prop) === 'string' ) {
			prop = this.prototype[prop];
		} else {
			prop = prop || {};
		}
		return $.extend({}, prop, props);
	}

	/**
	 * `self` is reference to parent
	 *
	 * @param  {Object} protoProps
	 *
	 * @return {Function}
	 */
	function extend ( protoProps ) {

		var self = this;

		function Child () {
			Child._super.constructor.apply(this, arguments);
		}
		function ChildTemp () {}
		ChildTemp.prototype = self.prototype;
		Child.prototype = new ChildTemp();

		$.extend(Child.prototype, protoProps, {
			constructor: Child
		});

		$.extend(Child, staticProps, {
			_super: self.prototype
		});

		return Child;

	}

	/**
	 * Pick props.
	 *
	 * @param  {Object} obj
	 * @param  {Array} set
	 *
	 * @return {Object}
	 */
	function pick ( obj, set ) {
		var tmp = {};
		for ( var prop in obj ) {
			if ( obj.hasOwnProperty(prop) ) {
				if ( $.inArray(prop, set) !== -1 ) {
					tmp[prop] = obj[prop];
				}
			}
		}
		return tmp;
	}

	/**
	 * Omit props.
	 *
	 * @param  {Object} obj
	 * @param  {Array} set
	 *
	 * @return {Object}
	 */
	function omit ( obj, set ) {
		var tmp = {};
		for ( var prop in obj ) {
			if ( obj.hasOwnProperty(prop) ) {
				if ( $.inArray(prop, set) !== -1 ) {
					continue;
				}
				tmp[prop] = obj[prop];
			}
		}
		return tmp;
	}

	/**
	 * @param {Object} options
	 */
	function Segment ( options ) {

		options = options || {};

		this.uid = instanceCount++;
		this.ens = plugin.ns.event + '.' + this.uid;

		$.extend(this, pick(options, segmentOptions));

		this._ensureElement();
		this.init.apply(this, arguments);

	}
	$.extend(Segment, staticProps);

	$.extend(Segment.prototype, {

		$html: $('html'),
		$body: $('body'),
		$doc: $(document),
		$win: $(window),

		_ensureElement: function () {
			if ( !this.el ) {
				return;
			}
			this.setElement(this.el);
		},

		/**
		 * @param {Mixed} el
		 */
		_setElement: function ( el ) {
			this.$el = $(typeof(el) === 'function' ? el.call(this) : el);
			this.el = this.$el[0];
		},

		_removeElement: function () {
			this.$el.remove();
		},

		events: {},

		childrenEl: {},

		/**
		 * @param  {Mixed} selector
		 *
		 * @return {jQuery}
		 */
		$: function ( selector ) {
			return this.$el.find(selector);
		},

		init: function () {

		},

		/**
		 * @return {Segment}
		 */
		render: function () {
			return this;
		},

		remove: function () {
			this._removeElement();
		},

		/**
		 * @param {Object} options
		 */
		setOptions: function ( options ) {
			this.options = $.extend({}, this.options, omit(options, segmentOptions));
		},

		/**
		 * @param {Element} el
		 */
		setElement: function ( el ) {
			this.undelegateEvents();
			this._setElement(el);
			this.delegateEvents();
			this.cacheChildrenEl();
		},

		/**
		 * @param  {Object} childrenEl
		 */
		cacheChildrenEl: function ( childrenEl ) {
			childrenEl = childrenEl || this.childrenEl;
			$.each(childrenEl, $.proxy(function ( name, selector ) {
				selector = this.$(typeof(selector) === 'function' ? selector.call(this) : selector);
				if ( !selector ) {
					return true;
				}
				this['$' + name] = selector;
			}, this));
		},

		/**
		 * @param  {Object} events
		 */
		delegateEvents: function ( events ) {
			events = events || this.events;
			var match;
			this.undelegateEvents();
			$.each(events, $.proxy(function ( list, method ) {
				if ( typeof(method) !== 'function' ) {
					method = this[method];
				}
				if ( !method ) {
					return true;
				}
				match = list.match(delegateEventSplitter);
				eventMatch = match[1].match(eventListSplitter);
				for ( var i = 0, eventMatchLength = eventMatch.length; i < eventMatchLength; i++ ) {
					this.delegate(eventMatch[i], match[2], $.proxy(method, this));
				}
			}, this));
		},

		undelegateEvents: function () {
			if ( this.$el ) {
				this.$el.off(this.ens);
			}
		},

		/**
		 * @param  {String} eventName
		 * @param  {String} selector
		 * @param  {Function} listener
		 */
		delegate: function ( eventName, selector, listener ) {
			this.$el.on(eventName + this.ens, selector, listener);
		},

		/**
		 * @param  {String} eventName
		 * @param  {String} selector
		 * @param  {Function} listener
		 *
		 * @return {}
		 */
		undelegate: function ( eventName, selector, listener ) {
			this.$el.off(eventName + this.ens, selector, listener);
		}

	});

	$.kist = $.kist || {};

	$.kist[plugin.name] = Segment;

})( jQuery, window, document );
