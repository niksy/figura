import assert from 'assert';
import scopedQuerySelectorAll from 'scoped-queryselectorall';
import matches from 'dom-matches';
import Fn from '../dom-diff';
import IndexFn from '../view';

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

	it('should have proper content after render diffing', function () {

		let count = 0;
		const shelby = new Fn({
			el: '#shelby'
		});
		let $originalEl, $newEl;

		$originalEl = shelby.$el;
		shelby.renderDiff(template(count));
		$newEl = shelby.$el;

		assert.equal(scopedQuerySelectorAll('.hazel', shelby.$el)[0].textContent, '0');
		assert.equal($originalEl.isSameNode($newEl), true);

		count++;
		count++;

		$originalEl = shelby.$el;
		shelby.renderDiff(template(count));
		$newEl = shelby.$el;

		assert.equal(scopedQuerySelectorAll('.hazel', shelby.$el)[0].textContent, '2');
		assert.equal($originalEl.isSameNode($newEl), true);

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

		assert.equal(matches(shelby.$el, 'span.hazel'), true);
		assert.equal(shelby.$el.textContent, '0');
		assert.equal($originalEl.isSameNode($newEl), false);

		count++;
		count++;

		$originalEl = shelby.$el;
		shelby.renderDiff(template(count));
		$newEl = shelby.$el;

		assert.equal(shelby.$el.textContent, '2');
		assert.equal($originalEl.isSameNode($newEl), true);

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
		shelby.renderDiff(content);
		shelby.renderDiff(content);
		$newEl = shelby.$el;

		assert.equal([...scopedQuerySelectorAll('#sasha', shelby.$el)].length, 1);
		assert.equal($originalEl.isSameNode($newEl), true);

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
		shelby.renderDiff(content);
		shelby.renderDiff(content);
		shelby.assignSubview('subviewTwoPlaceholder');
		$newEl = shelby.$el;

		assert.equal([...scopedQuerySelectorAll('#sasha', shelby.$el)].length, 1);
		assert.equal([...scopedQuerySelectorAll('.lilly', shelby.$el)].length, 1);
		assert.equal([...scopedQuerySelectorAll(`[data-view-uid="${subviewThree.uid}"]`, shelby.$el)].length, 1);
		assert.equal($originalEl.isSameNode($newEl), false);

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
		shelby.renderDiff(content);
		shelby.renderDiff(content, () => {

			$newEl = shelby.$el;

			assert.equal([...scopedQuerySelectorAll('#sasha', shelby.$el)].length, 1);
			assert.equal($originalEl.isSameNode($newEl), true);

			shelby.remove();

			done();

		});

	});

});
