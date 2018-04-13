import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import Spanan from '../../index';

describe('Spanan', function () {
  before(function () {
    chai.use(sinonChai);
    chai.use(chaiAsPromised);
  });

  describe('#constructor', function () {
    it('sets first argument as sendFunction property', function () {
      const fn = function () {};
      expect(new Spanan(fn)).to.have.property('sendFunction', fn);
    });

    it('sets property callbacks to empty Map', function () {
      expect(new Spanan()).to.have.property('callbacks')
        .that.is.instanceof(Map)
        .with.property('size', 0);
    });
  });


  describe('#send', function () {
    it('calls #sendFunction', function () {
      const spy = sinon.spy();
      const spanan = new Spanan();
      const action = 'test';
      const args = [1, 2, 3];
      spanan.sendFunction = spy;

      spanan.send(action, ...args);

      expect(spy).to.have.been.calledWithMatch(sinon.match({ action, args }));
      expect(spy).to.have.been.calledWithMatch(sinon.match.has('uuid'));
    });

    it('returns a Promise', function () {
      const spanan = new Spanan(() => {});
      expect(spanan.send()).to.be.an.instanceof(Promise);
    });

    it('increases callback count', function () {
      const spanan = new Spanan(() => {});
      expect(spanan.send.bind(spanan)).to.increase(spanan.callbacks, 'size');
    });

    it('sets callback with a key equal to message uuid', function () {
      let callbackId;
      const spanan = new Spanan(({ uuid }) => { callbackId = uuid; });
      expect(spanan.callbacks.has(callbackId)).to.be.false;
      spanan.send();
      expect(spanan.callbacks.has(callbackId)).to.be.true;
    });

    it('sets callback that resolves returned promise with a value', function () {
      let callbackId;
      const spanan = new Spanan(({ uuid }) => { callbackId = uuid; });
      const promise = spanan.send();
      const value = 'test';
      spanan.callbacks.get(callbackId)(value);
      return promise.then(response => expect(response).to.equal(value));
    });
  });

  describe('#dispatch', function () {
    it('returns false if there was no callback for given message id', function () {
      const spanan = new Spanan();
      expect(spanan.dispatch()).to.equal(false);
    });

    it('returns true if there was a callback pending', function () {
      let messageId;
      const spanan = new Spanan(({ uuid }) => { messageId = uuid; });
      spanan.send();
      expect(spanan.dispatch({
        uuid: messageId,
        response: null,
      })).to.equal(true);
    });

    it('calls callback with message response', function () {
      let messageId;
      const response = 'test';
      const spanan = new Spanan(({ uuid }) => { messageId = uuid; });
      const promise = spanan.send().then((value) => {
        expect(value).to.equal(response);
      });
      spanan.dispatch({
        uuid: messageId,
        response,
      });
      return promise;
    });

    it('removes callback after being called', function () {
      let messageId;
      const spanan = new Spanan(({ uuid }) => { messageId = uuid; });
      spanan.callbacks.set(messageId, () => {});
      expect(spanan.callbacks.has(messageId)).to.equal(true);
      spanan.dispatch({
        uuid: messageId,
        response: undefined,
      });
      expect(spanan.callbacks.has(messageId)).to.equal(false);
    });
  });

  describe('#createProxy', function () {
    it('calling whatever method on proxy calls .send', function () {
      const spy = sinon.spy();
      const spanan = new Spanan();
      const subject = spanan.createProxy();

      spanan.sendFunction = spy;

      subject.test();
      subject.echo(1);
      subject.someMethod('1', '2');
      expect(spy).to.have.callCount(3);
    });
  });

  describe('#handleMessage', function () {
    context('with default logger', function () {
      beforeEach(function () {
        sinon.spy(console, 'error');
      });

      afterEach(function () {
        // eslint-disable-next-line
        console.error.restore();
      });

      it('logs errors', function () {
        let messageId;
        const spanan = new Spanan(({ uuid }) => { messageId = uuid; });
        spanan.callbacks.set(messageId, () => { throw new Error(); });
        spanan.handleMessage({
          uuid: messageId,
          response: 0,
        });
        // eslint-disable-next-line
        expect(console.error).to.be.called;
      });
    });

    context('with custom logger', function () {
      it('logs errors', function () {
        const logger = sinon.spy();
        let messageId;
        const spanan = new Spanan(({ uuid }) => { messageId = uuid; }, {
          errorLogger: logger,
        });
        spanan.callbacks.set(messageId, () => { throw new Error(); });
        spanan.handleMessage({
          uuid: messageId,
          response: '',
        });
        expect(logger).to.be.called;
      });
    });
  });
});
