'use strict';

const assert = require('assert');
const sinon = require('sinon');
const $ = require('jquery');
const Fn = require('../index');
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
		assert.equal(shelby.ens, '.kist.view.0');
		assert.equal(shelby.$html.is($('html')), true);
		assert.equal(shelby.$body.is($('body')), true);
		assert.equal(shelby.$doc.is($(document)), true);
		assert.equal(shelby.$win.is($(window)), true);
		shelby.remove();
	});

});

describe('Methods', function () {

	describe('View#$', function () {

		it('should find child node of element', function () {
			const shelby = new Fn({
				el: '#shelby'
			});
			assert.equal(shelby.$('#sasha').is($('#sasha')), true);
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

			assert.equal(shelby.$el.is($('#shelby')), true);
			shelby.remove();
			assert.equal(shelby.$el.is($('#shelby')), false);

			shelby.remove();

		});

	});

	describe('View#setOptions', function () {

		it('should properly set and merge default options', function () {

			const Shelby = Fn.extend({
				initialize: function ( options ) {
					this.setOptions(options);
				}
			});

			const shelby = new Shelby({
				el: '#shelby',
				events: {},
				jackie: 'riley',
				rudy: 'piper'
			});
			assert.deepEqual(shelby.options, {
				jackie: 'riley',
				rudy: 'piper'
			});

			shelby.setOptions({
				jackie: 'nala'
			});
			assert.deepEqual(shelby.options, {
				jackie: 'nala',
				rudy: 'piper'
			});

			shelby.remove();

		});

	});

	describe('View#setElement', function () {

		it('should set view element to another element', function () {

			const shelby = new Fn({
				el: '#shelby'
			});
			const $shelby = $('#shelby');
			const $lilly = $('.lilly');

			assert.equal(shelby.$el.is($shelby), true);
			assert.equal(shelby.el.isEqualNode($shelby[0]), true);

			shelby.setElement($lilly);

			assert.equal(shelby.$el.is($shelby), false);
			assert.equal(shelby.el.isEqualNode($shelby[0]), false);
			assert.equal(shelby.$el.is($lilly), true);
			assert.equal(shelby.el.isEqualNode($lilly[0]), true);

			shelby.remove();

		});

	});

	describe('View#cacheChildrenEl', function () {

		it('should cache children elements', function () {

			const Shelby = Fn.extend({
				childrenEl: {
					sasha: '#sasha',
					lilly: '.lilly'
				}
			});
			const shelby = new Shelby({
				el: '#shelby'
			});

			assert.equal(shelby.$sasha.is('#sasha'), true);
			assert.equal(shelby.$sasha.selector, '#shelby #sasha');
			assert.equal(shelby.$lilly.is('.lilly'), true);
			assert.equal(shelby.$lilly.selector, '#shelby .lilly');

			shelby.cacheChildrenEl({
				roxie: '.roxie'
			});

			assert.equal(shelby.$roxie.is('.roxie'), true);
			assert.equal(shelby.$roxie.selector, '#shelby .roxie');

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
			const $sasha = $('#sasha');

			$sasha.trigger('click');
			$sasha.trigger('click');

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
			const $sasha = $('#sasha');

			shelby.delegateEvents({
				'click #sasha': newSpy
			});
			$sasha.trigger('click');
			$sasha.trigger('click');

			assert.equal(spy.called, false);
			assert.equal(spy.calledOnce, false);
			assert.equal(newSpy.called, true);
			assert.equal(newSpy.calledOnce, false);

			shelby.remove();

		});

		it('should handle method names as event listeners', function () {

			const spy = sinon.spy();
			const Shelby = Fn.extend({
				gracie: function () {
					spy('gracie');
				}
			});
			const shelby = new Shelby({
				el: '#shelby',
				events: {
					'click #sasha': 'gracie'
				}
			});
			const $sasha = $('#sasha');

			$sasha.trigger('click');
			$sasha.trigger('click');

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
			const $sasha = $('#sasha');

			shelby.undelegateEvents();
			$sasha.trigger('click');
			$sasha.trigger('click');

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
			const $sasha = $('#sasha');

			shelby.delegate('click', '#sasha', spy);
			$sasha.trigger('click');
			$sasha.trigger('click');

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
			const $sasha = $('#sasha');

			shelby.delegate('click', '#sasha', spy);
			$sasha.trigger('click');
			shelby.undelegate('click', '#sasha', spy);
			$sasha.trigger('click');
			$sasha.trigger('click');

			assert.equal(spy.called, true);
			assert.equal(spy.calledOnce, true);

			shelby.remove();

		});

	});

});

describe('Integration', function () {

	it('should handle simple view case', function () {

		const spy = sinon.spy();
		const Shelby = Fn.extend({
			el: '#shelby',
			childrenEl: {
				sasha: '#sasha',
				lilly: '.lilly'
			},
			events: {
				'click .lilly': 'testClick'
			},
			initialize: function ( options ) {
				this.setOptions(options);
			},
			testClick: function () {
				spy('.lilly clicked!');
			}
		});

		const shelby = new Shelby({
			jackie: 'riley',
			rudy: 'piper'
		});
		shelby.$lilly.trigger('click');
		shelby.$lilly.trigger('click');
		shelby.$lilly.trigger('click');

		assert.equal(shelby instanceof Fn, true);
		assert.equal(shelby.uid, 13);
		assert.equal(shelby.ens, '.kist.view.13');
		assert.deepEqual(shelby.options, {
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

		const Shelby = Fn.extend({
			el: '#shelby',
			constructor: function () {
				spyConstructorOne('Calling custom constructor…');
				Fn.prototype.constructor.apply(this, arguments);
			},
			childrenEl: {
				sasha: '#sasha',
				lilly: '.lilly'
			},
			events: {
				'click .lilly': 'testClick'
			},
			initialize: function ( options ) {
				this.setOptions(options);
			},
			testClick: function () {
				spyOne('.lilly clicked!');
			}
		});

		const Sasha = Shelby.extend({
			constructor: function () {
				Shelby.prototype.constructor.apply(this, arguments);
				spyConstructorTwo('Calling custom constructor, second time…');
			},
			childrenEl: $.extend({}, Shelby.prototype.childrenEl, {
				honey: '.honey'
			}),
			testClick: function () {
				Shelby.prototype.testClick.call(this);
				spyTwo('.lilly clicked, with overriden method on `Sasha`.');
			}
		});

		const shelby = new Shelby();
		const sasha = new Sasha();

		shelby.$lilly.trigger('click');
		shelby.$lilly.trigger('click');
		shelby.$lilly.trigger('click');

		assert.equal(sasha.$honey.is('.honey'), true);

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
