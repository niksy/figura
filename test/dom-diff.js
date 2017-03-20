'use strict';

const assert = require('assert');
const createMockRaf = require('mock-raf');
const sinon = require('sinon');
const $ = require('jquery');
const Fn = require('../dom-diff');
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

describe('DOM diff', function () {

	const mockRaf = createMockRaf();
	let stub;

	before(function () {
		if ( !window.requestAnimationFrame ) {
			window.requestAnimationFrame = () => {};
		}
		stub = sinon.stub(window, 'requestAnimationFrame', mockRaf.raf);
	});

	after(function () {
		stub.restore();
	});

	it('should have proper content after render diffing', function () {

		let count = 0;
		const shelby = new Fn({
			el: '#shelby'
		});
		let $originalEl, $newEl;

		$originalEl = shelby.$el;
		shelby.renderDiff($(template(count)));
		mockRaf.step();
		$newEl = shelby.$el;

		assert.equal(shelby.$el.find('.hazel').text(), '0');
		assert.equal($originalEl[0].isSameNode($newEl[0]), true);

		count++;
		count++;

		$originalEl = shelby.$el;
		shelby.renderDiff($(template(count)));
		mockRaf.step();
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
		mockRaf.step();
		$newEl = shelby.$el;

		assert.equal(shelby.$el.is('span.hazel'), true);
		assert.equal(shelby.$el.text(), '0');
		assert.equal($originalEl[0].isSameNode($newEl[0]), false);

		count++;
		count++;

		$originalEl = shelby.$el;
		shelby.renderDiff(template(count));
		mockRaf.step();
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

		$originalEl = shelby.$el;
		const content = subview.getRenderPlaceholder();
		shelby.renderDiff(content);
		mockRaf.step();
		shelby.renderDiff(content);
		mockRaf.step();
		shelby.renderDiff(content);
		mockRaf.step();
		$newEl = shelby.$el;

		assert.equal(shelby.$el.find('#sasha').length, 1);
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

		$originalEl = shelby.$el;
		const content = `<div>${subviewOne.getRenderPlaceholder()}${subviewTwo.getRenderPlaceholder()}${subviewThree.getRenderPlaceholder()}</div>`;
		shelby.renderDiff(content);
		mockRaf.step();
		shelby.renderDiff(content);
		mockRaf.step();
		shelby.renderDiff(content);
		mockRaf.step();
		shelby.assignSubview('subviewTwoPlaceholder');
		$newEl = shelby.$el;

		assert.equal(shelby.$el.find('#sasha').length, 1);
		assert.equal(shelby.$el.find('.lilly').length, 1);
		assert.equal(shelby.$el.find(`[data-view-uid="${subviewThree.uid}"]`).length, 1);
		assert.equal($originalEl[0].isSameNode($newEl[0]), false);

		shelby.remove();

	});

	it('should throw if template has more than one parent element when `fromTemplate` is true', function () {

		let count = 0;
		const shelby = new Fn({
			el: '#shelby',
			fromTemplate: true
		});

		assert.throws(() => {
			shelby.renderDiff(`<div>hazel</div>${template(count)}`);
			mockRaf.step();
		}, 'View must contain only one parent element.');

		shelby.remove();

	});

	it('should call callback function after element is updated', function ( done ) {

		const shelby = new Fn({
			el: '#shelby'
		});
		let $originalEl, $newEl;

		shelby.addSubview(new Fn({
			el: '#sasha'
		}), 'subviewPlaceholder');

		const subview = shelby.getSubview('subviewPlaceholder');

		$originalEl = shelby.$el;
		const content = subview.getRenderPlaceholder();
		shelby.renderDiff(content);
		mockRaf.step();
		shelby.renderDiff(content);
		mockRaf.step();
		shelby.renderDiff(content, () => {

			$newEl = shelby.$el;

			assert.equal(shelby.$el.find('#sasha').length, 1);
			assert.equal($originalEl[0].isSameNode($newEl[0]), true);

			shelby.remove();

			done();

		});
		mockRaf.step();

	});

});
