'use strict';

const assert = require('assert');
const $ = require('jquery');
const Fn = require('../virtual-dom');
const IndexFn = require('../index');
const fixture = window.__html__['test/fixtures/index.html'];

beforeEach(function () {
	document.body.insertAdjacentHTML('beforeend', `<div id="fixture">${fixture}</div>`);
});

afterEach(function () {
	document.body.removeChild(document.getElementById('fixture'));
});

function template ( count ) {
	return `<span class="hazel">${count}</span>`;
}

describe('Virtual DOM', function () {

	it('should have proper content after render diffing', function () {

		let count = 0;
		const shelby = new Fn({
			el: '#shelby'
		});
		let $originalEl, $newEl;

		$originalEl = shelby.$el;
		shelby.renderDiff($(template(count)));
		$newEl = shelby.$el;

		assert.equal(shelby.$el.find('.hazel').text(), '0');
		assert.equal($originalEl[0].isSameNode($newEl[0]), true);

		count++;
		count++;

		$originalEl = shelby.$el;
		shelby.renderDiff($(template(count)));
		$newEl = shelby.$el;

		assert.equal(shelby.$el.find('.hazel').text(), '2');
		assert.equal($originalEl[0].isSameNode($newEl[0]), true);

		shelby.remove();

	});

	it('should render it’s view fully from template if `fromTemplate` is set to true', function () {

		let count = 0;
		const shelby = new Fn({
			el: '#shelby',
			fromTemplate: true
		});
		let $originalEl, $newEl;

		$originalEl = shelby.$el;
		shelby.renderDiff(template(count));
		$newEl = shelby.$el;

		assert.equal(shelby.$el.is('span.hazel'), true);
		assert.equal(shelby.$el.text(), '0');
		assert.equal($originalEl[0].isSameNode($newEl[0]), false);

		count++;
		count++;

		$originalEl = shelby.$el;
		shelby.renderDiff(template(count));
		$newEl = shelby.$el;

		assert.equal(shelby.$el.text(), '2');
		assert.equal($originalEl[0].isSameNode($newEl[0]), true);

		shelby.remove();

	});

	it('should handle subviews', function () {

		const shelby = new Fn({
			el: '#shelby'
		});
		let $originalEl, $newEl;

		shelby.addSubview(new Fn({
			el: '#sasha'
		}), 'subviewPlaceholder');

		const subview = shelby.getSubview('subviewPlaceholder');

		shelby.render = function () {
			$originalEl = this.$el;
			this.renderDiff(subview.getRenderPlaceholder());
			$newEl = this.$el;
			return this;
		};

		assert.equal($(shelby.render().el).find('#sasha').length, 1);
		assert.equal($originalEl[0].isSameNode($newEl[0]), true);

		shelby.remove();

	});

	it('should handle subviews when `fromTemplate` is set to true', function () {

		const shelby = new Fn({
			el: '#shelby',
			fromTemplate: true
		});
		let $originalEl, $newEl;

		shelby.addSubview(new Fn({
			el: '#sasha'
		}), 'subviewOnePlaceholder');
		shelby.addSubview(new IndexFn({
			el: '.lilly'
		}), 'subviewTwoPlaceholder');
		shelby.addSubview(new IndexFn({
			el: '.roxie'
		}), 'subviewThreePlaceholder');

		const subviewOne = shelby.getSubview('subviewOnePlaceholder');
		const subviewTwo = shelby.getSubview('subviewTwoPlaceholder');
		const subviewThree = shelby.getSubview('subviewThreePlaceholder');

		shelby.render = function () {
			$originalEl = this.$el;
			this.renderDiff(`<div>${subviewOne.getRenderPlaceholder()}${subviewTwo.getRenderPlaceholder()}${subviewThree.getRenderPlaceholder()}</div>`);
			this.assignSubview('subviewTwoPlaceholder');
			$newEl = this.$el;
			return this;
		};

		const view = $(shelby.render().el);

		assert.equal(view.find('#sasha').length, 1);
		assert.equal(view.find('.lilly').length, 1);
		assert.equal(view.find(`[data-view-uid="${subviewThree.uid}"]`).length, 1);
		assert.equal($originalEl[0].isSameNode($newEl[0]), false);

		shelby.remove();

	});

});
