import morphdom from 'morphdom';
import View from './view';

const hasOwnProp = Object.prototype.hasOwnProperty;

/**
 * @param  {String} template
 *
 * @return {Element}
 */
function getElementFromTemplate ( template ) {
	const node = document.createElement('div');
	node.insertAdjacentHTML('beforeend', template);
	if ( node.childNodes.length !== 1 ) {
		throw new Error('View must contain only one parent element.');
	}
	return node.firstChild;
}

/**
 * @param  {View} ctx
 */
function handleSubviews ( ctx ) {

	for ( let key in ctx.subviews ) {
		if ( hasOwnProp.call(ctx.subviews, key) ) {
			const subview = ctx.subviews[key];
			if ( subview._usesRenderPlaceholder ) {
				ctx.assignSubview(key);
			}
		}
	}

}

class DomDiffView extends View {

	get fromTemplate () {
		const { _fromTemplate = false } = this;
		return _fromTemplate;
	}

	set fromTemplate ( value = false ) {
		this._fromTemplate = value;
	}

	constructor ( options = {} ) {
		super(options);
		['fromTemplate'].forEach(( viewOption ) => {
			if ( viewOption in options ) {
				this[viewOption] = options[viewOption];
			}
		});
	}

	/**
	 * Get subview placeholder
	 *
	 * @return {String}
	 */
	getRenderPlaceholder ( ...args ) {
		this._usesRenderPlaceholder = true;
		return super.getRenderPlaceholder(...args);
	}

	/**
	 * Renders DOM diffed content
	 *
	 * @param  {String} content
	 * @param  {Function} cb
	 *
	 * @return {View}
	 */
	renderDiff ( content, cb ) {

		if ( this.fromTemplate && !this._domDiffReady ) {
			this._domDiffReady = true;

			// If we’re getting the whole view DOM from template, we first
			// check if there is only one parent element; if it’s not,
			// inform implementor to correct that, otherwise set `this.$el` to
			// the parent element from template
			this.setElement(getElementFromTemplate(content));
			handleSubviews(this);

			return this;

		}

		this._domDiffReady = true;

		let newEl;
		if ( this.fromTemplate ) {
			newEl = getElementFromTemplate(content);
		} else {
			const clonedNode = this.$el.cloneNode(true);
			clonedNode.innerHTML = content;
			newEl = clonedNode;
		}

		if ( typeof cb === 'function' ) {
			morphdom(this.$el, newEl, {
				onElUpdated: () => {
					handleSubviews(this);
					cb();
				}
			});
		} else {
			morphdom(this.$el, newEl);
			handleSubviews(this);
		}

		return this;

	}

};

export default DomDiffView;
