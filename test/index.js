import assert from 'assert';
import sinon from 'sinon';
import simulant from 'simulant';
import scopedQuerySelectorAll from 'scoped-queryselectorall';
import Fn from '../index';

const fixture = window.__html__['test/fixtures/index.html'];

beforeEach(function () {
	document.body.insertAdjacentHTML('beforeend', `<div id="fixture">${fixture}</div>`);
});

afterEach(function () {
	document.body.removeChild(document.getElementById('fixture'));
});

describe('Basic', function () {

	it('should create instance of view', function () {
		const shelby = new Fn();
		assert.equal(shelby instanceof Fn, true);
		assert.equal(shelby.uid, 0);
		shelby.remove();
	});

});

describe('Methods', function () {

	describe('View#$', function () {

		it('should find child node of element', function () {
			const shelby = new Fn({
				el: '#shelby'
			});
			assert.equal(shelby.$('#sasha'), document.querySelector('#sasha'));
			shelby.remove();
		});

	});

	describe('View#render', function () {

		it('should return view instance', function () {
			const shelby = new Fn();
			assert.equal(shelby.render() instanceof Fn, true);
			shelby.remove();
		});

	});

	describe('View#remove', function () {

		it('should remove element', function () {

			const shelby = new Fn({
				el: '#shelby'
			});

			assert.equal(shelby.$el, document.querySelector('#shelby'));
			shelby.remove();
			assert.equal(typeof shelby.$el, 'undefined');
			assert.equal(document.querySelector('#shelby'), null);

			shelby.remove();

		});

	});

	describe('View#setElement', function () {

		it('should set view element to another element', function () {

			const shelby = new Fn({
				el: '#shelby'
			});
			const $shelby = document.querySelector('#shelby');
			const $lilly = document.querySelector('.lilly');

			assert.equal(shelby.$el, $shelby);
			assert.equal(shelby.$el.isSameNode($shelby), true);

			shelby.setElement($lilly);

			assert.notEqual(shelby.$el, $shelby);
			assert.equal(shelby.$el.isSameNode($shelby), false);
			assert.equal(shelby.$el, $lilly);
			assert.equal(shelby.$el.isSameNode($lilly), true);

			shelby.remove();

		});

	});

	describe('View#cacheChildrenEl', function () {

		it('should cache children elements from original elements hash', function () {

			const shelby = new Fn({
				el: '#shelby',
				childrenEl: {
					sasha: '#sasha',
					lilly: '.lilly',
					'honey[]': '.honey'
				}
			});

			assert.equal(shelby.$sasha, document.querySelector('#sasha'));
			assert.equal(shelby.$lilly, document.querySelector('.lilly'));
			assert.equal(shelby.$honey[0], document.querySelector('.honey'));

			shelby.remove();

		});

		it('should cache children elements from passed elements hash', function () {

			const shelby = new Fn({
				el: '#shelby',
				childrenEl: {
					sasha: '#sasha',
					lilly: '.lilly'
				}
			});

			assert.equal(shelby.$sasha, document.querySelector('#sasha'));
			assert.equal(shelby.$lilly, document.querySelector('.lilly'));

			shelby.cacheChildrenEl({
				roxie: '.roxie'
			});

			assert.equal(shelby.$roxie[0], document.querySelector('.roxie'));

			shelby.remove();

		});

	});

	describe('View#delegateEvents', function () {

		it('should delegate events from original events hash to child elements', function () {

			const spy = sinon.spy();
			const shelby = new Fn({
				el: '#shelby',
				events: {
					'click #sasha': spy
				}
			});
			const $sasha = document.querySelector('#sasha');

			simulant.fire($sasha, 'click');
			simulant.fire($sasha, 'click');

			assert.equal(spy.called, true);
			assert.equal(spy.calledOnce, false);

			shelby.remove();

		});

		it('should delegate events from passed events hash to child elements', function () {

			const spy = sinon.spy();
			const newSpy = sinon.spy();
			const shelby = new Fn({
				el: '#shelby',
				events: {
					'click #sasha': spy
				}
			});
			const $sasha = document.querySelector('#sasha');

			shelby.delegateEvents({
				'click #sasha': newSpy
			});
			simulant.fire($sasha, 'click');
			simulant.fire($sasha, 'click');

			assert.equal(spy.called, false);
			assert.equal(spy.calledOnce, false);
			assert.equal(newSpy.called, true);
			assert.equal(newSpy.calledOnce, false);

			shelby.remove();

		});

		it('should handle method names as event listeners', function () {

			const spy = sinon.spy();
			class Shelby extends Fn {
				gracie () {
					spy('gracie');
				}
			};
			const shelby = new Shelby({
				el: '#shelby',
				events: {
					'click #sasha': 'gracie'
				}
			});
			const $sasha = document.querySelector('#sasha');

			simulant.fire($sasha, 'click');
			simulant.fire($sasha, 'click');

			assert.equal(spy.called, true);
			assert.equal(spy.calledOnce, false);
			assert.equal(spy.calledWith('gracie'), true);

			shelby.remove();

		});

	});

	describe('View#undelegateEvents', function () {

		it('should undelegate events from element', function () {

			const spy = sinon.spy();
			const shelby = new Fn({
				el: '#shelby',
				events: {
					'click #sasha': spy
				}
			});
			const $sasha = document.querySelector('#sasha');

			shelby.undelegateEvents();
			simulant.fire($sasha, 'click');
			simulant.fire($sasha, 'click');

			assert.equal(spy.called, false);
			assert.equal(spy.calledOnce, false);

			shelby.remove();

		});

	});

	describe('View#delegate', function () {

		it('should delegate event to child element', function () {

			const spy = sinon.spy();
			const shelby = new Fn({
				el: '#shelby'
			});
			const $sasha = document.querySelector('#sasha');

			shelby.delegate('click', '#sasha', spy);
			simulant.fire($sasha, 'click');
			simulant.fire($sasha, 'click');

			assert.equal(spy.called, true);
			assert.equal(spy.calledOnce, false);

			shelby.remove();

		});

	});

	describe('View#undelegate', function () {

		it('should undelegate event to child element', function () {

			const spy = sinon.spy();
			const shelby = new Fn({
				el: '#shelby'
			});
			const $sasha = document.querySelector('#sasha');

			shelby.delegate('click', '#sasha', spy);
			simulant.fire($sasha, 'click');
			shelby.undelegate('click', '#sasha', spy);
			simulant.fire($sasha, 'click');
			simulant.fire($sasha, 'click');

			assert.equal(spy.called, true);
			assert.equal(spy.calledOnce, true);

			shelby.remove();

		});

	});

});

describe('Subviews', function () {

	it('should have 3 subviews after adding them', function () {

		const shelby = new Fn({
			el: '#shelby'
		});

		shelby.addSubview(new Fn());
		shelby.addSubview(new Fn());
		shelby.addSubview(new Fn(), 'customKey');

		assert.equal(Object.keys(shelby.subviews).length, 3);
		assert.equal(shelby.getSubview('customKey') instanceof Fn, true);

		shelby.remove();

	});

	it('should not have any subviews after removing them with `removeSubviews`', function () {

		const shelby = new Fn({
			el: '#shelby'
		});

		shelby.addSubview(new Fn());
		assert.equal(Object.keys(shelby.subviews).length, 1);

		shelby.removeSubviews();
		assert.equal(Object.keys(shelby.subviews).length, 0);

		shelby.remove();

	});

	it('should have 2 subviews after adding them again', function () {

		const shelby = new Fn({
			el: '#shelby'
		});

		shelby.addSubview(new Fn());
		assert.equal(Object.keys(shelby.subviews).length, 1);

		shelby.removeSubviews();
		shelby.addSubview(new Fn());
		shelby.addSubview(new Fn());
		assert.equal(Object.keys(shelby.subviews).length, 2);

		assert.equal(Object.keys(shelby.subviews).length, 2);

		shelby.remove();

	});

	it('should render it’s subview placeholder with `getRenderPlaceholder`', function () {

		const shelby = new Fn({
			el: '#shelby'
		});

		shelby.addSubview(new Fn({
			el: '#sasha'
		}), 'subviewPlaceholder');

		const subview = shelby.getSubview('subviewPlaceholder');

		assert.equal(subview.getRenderPlaceholder(), `<div data-view-uid="${subview.uid}"></div>`);

		shelby.remove();

	});

	it('should properly render subview content with `assignSubview`', function () {

		const shelby = new Fn({
			el: '#shelby'
		});

		shelby.addSubview(new Fn({
			el: '#sasha'
		}), 'subviewPlaceholder');

		const subview = shelby.getSubview('subviewPlaceholder');

		shelby.render = function () {
			this.$el.innerHTML = subview.getRenderPlaceholder();
			this.assignSubview('subviewPlaceholder');
			return this;
		};

		assert.equal([...scopedQuerySelectorAll('#sasha', shelby.render().$el)].length, 1);

		shelby.remove();

	});

	it('should not have any subviews after removing them with `remove`', function () {

		const shelby = new Fn({
			el: '#shelby'
		});

		shelby.remove();
		assert.equal(shelby.subviews, undefined); // eslint-disable-line no-undefined

	});

	it('should throw when trying to assign subview which is not proper instance', function () {

		const shelby = new Fn();

		assert.throws(() => shelby.addSubview('jackie'), TypeError);

		shelby.remove();

	});

});

describe('State and props', function () {

	it('should set state', function () {

		const view = new Fn();

		view.setState({
			jackie: 42
		});

		const state = view.state;

		assert.equal(state.jackie, 42);

		view.remove();

	});

	it('should set props', function () {

		const view = new Fn({
			jackie: 42
		});

		const props = view.props;

		assert.equal(props.jackie, 42);

		view.remove();

	});

	it('should set state with state value modified', function () {

		class View extends Fn {
			stateValueModifier ( key, value ) {
				if ( key === 'romeo' ) {
					return parseInt(value, 10);
				}
				return value;
			}
		}

		const view = new View();

		view.setState({
			romeo: '42'
		});

		const state = view.state;

		assert.equal(typeof state.romeo, 'number');
		assert.equal(state.romeo, 42);

		view.remove();

	});

	it('should set props with prop value modified', function () {

		class View extends Fn {
			propValueModifier ( key, value ) {
				if ( key === 'romeo' ) {
					return parseInt(value, 10);
				}
				return value;
			}
		}

		const view = new View({
			romeo: '42'
		});

		const props = view.props;

		assert.equal(typeof props.romeo, 'number');
		assert.equal(props.romeo, 42);

		view.remove();

	});

});

describe('Integration', function () {

	it('should handle simple view case', function () {

		const spy = sinon.spy();
		class Shelby extends Fn {
			el () {
				return '#shelby';
			}
			childrenEl () {
				return {
					sasha: '#sasha',
					lilly: '.lilly'
				};
			}
			events () {
				return {
					'click .lilly': 'testClick'
				};
			}
			testClick () {
				spy('.lilly clicked!');
			}
		};

		const shelby = new Shelby({
			jackie: 'riley',
			rudy: 'piper'
		});
		simulant.fire(shelby.$lilly, 'click');
		simulant.fire(shelby.$lilly, 'click');
		simulant.fire(shelby.$lilly, 'click');

		assert.equal(shelby instanceof Fn, true);
		assert.equal(shelby.uid > 0, true);
		assert.deepEqual(shelby.props, {
			jackie: 'riley',
			rudy: 'piper'
		});
		assert.equal(spy.called, true);
		assert.equal(spy.callCount, 3);
		assert.equal(spy.calledWith('.lilly clicked!'), true);

		shelby.remove();

	});

	it('should handle view extending', function () {

		const spyOne = sinon.spy();
		const spyTwo = sinon.spy();
		const spyConstructorOne = sinon.spy();
		const spyConstructorTwo = sinon.spy();

		class Shelby extends Fn {
			el () {
				return '#shelby';
			}
			constructor ( ...args ) {
				super(...args);
				spyConstructorOne('Calling custom constructor…');
			}
			childrenEl () {
				return {
					sasha: '#sasha',
					lilly: '.lilly'
				};
			}
			events () {
				return {
					'click .lilly': 'testClick'
				};
			}
			testClick () {
				spyOne('.lilly clicked!');
			}
		};

		class Sasha extends Shelby {
			constructor ( ...args ) {
				super(...args);
				spyConstructorTwo('Calling custom constructor, second time…');
			}
			childrenEl () {
				return {
					...super.childrenEl(),
					honey: '.honey'
				};
			}
			testClick () {
				super.testClick();
				spyTwo('.lilly clicked, with overriden method on `Sasha`.');
			}
		};

		const shelby = new Shelby();
		const sasha = new Sasha();

		simulant.fire(shelby.$lilly, 'click');
		simulant.fire(shelby.$lilly, 'click');
		simulant.fire(shelby.$lilly, 'click');

		assert.equal(sasha.$lilly, document.querySelector('.lilly'));
		assert.equal(sasha.$honey, document.querySelector('.honey'));

		assert.equal(spyConstructorOne.called, true);
		assert.equal(spyConstructorOne.callCount, 2);
		assert.equal(spyConstructorOne.calledWith('Calling custom constructor…'), true);

		assert.equal(spyConstructorTwo.called, true);
		assert.equal(spyConstructorTwo.callCount, 1);
		assert.equal(spyConstructorTwo.calledWith('Calling custom constructor, second time…'), true);

		assert.equal(spyOne.called, true);
		assert.equal(spyOne.callCount, 6);
		assert.equal(spyOne.calledWith('.lilly clicked!'), true);

		assert.equal(spyTwo.called, true);
		assert.equal(spyTwo.callCount, 3);
		assert.equal(spyTwo.calledWith('.lilly clicked, with overriden method on `Sasha`.'), true);

		shelby.remove();

	});

});
