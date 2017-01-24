import { expect, default as chai } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import Spanan from '../index';

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

  describe('#uuid', function () {
    it('returns new uuid on every call', function () {
      expect(Spanan.uuid()).to.not.be.equal(Spanan.uuid());
    });

    it('returns a valid uuid v4', function () {
      expect(Spanan.uuid()).to.have.property('length', 36);
    });
  });

  describe('.send', function () {
    it('calls .sendFunction', function () {
      const spy = sinon.spy();
      const spanan = new Spanan();
      const functionName = 'test';
      const args = [1,2,3];
      spanan.sendFunction = spy;

      spanan.send(functionName, ...args);

      expect(spy).to.have.been.calledWithMatch(
        sinon.match({ functionName, args, })
      );
      expect(spy).to.have.been.calledWithMatch(
        sinon.match.has('uuid')
      );
    });

    it('returns a Promise', function () {
      const spanan = new Spanan(() => {});
      expect(spanan.send()).to.be.an.instanceof(Promise)
    });

    it('increases callback count', function () {
      const spanan = new Spanan(() => {});
      expect(spanan.send.bind(spanan)).to.increase(spanan.callbacks, 'size');
    });

    it('sets callback with a key equal to message uuid', function () {
      let callbackId;
      const spanan = new Spanan(({ uuid }) => callbackId = uuid);
      expect(spanan.callbacks.has(callbackId)).to.be.false;
      spanan.send();
      expect(spanan.callbacks.has(callbackId)).to.be.true;
    });

    it('sets callback that resolves returned promise with a value', function () {
      let callbackId;
      const spanan = new Spanan(({ uuid }) => callbackId = uuid);
      const promise = spanan.send();
      const value = 'test';
      spanan.callbacks.get(callbackId)(value);
      return promise.then(returnedValue => {
        expect(returnedValue).to.equal(value);
      });
    });
  });

  describe('.dispatch', function () {
    it('returns false if there was no callback for given message id', function () {
      const spanan = new Spanan();
      expect(spanan.dispatch()).to.equal(false);
    });

    it('returns true if there was a callback pending', function () {
      let messageId;
      const spanan = new Spanan(({ uuid }) => messageId = uuid);
      spanan.send();
      expect(spanan.dispatch({ uuid: messageId })).to.equal(true);
    });

    it('calls callback with message returnedValue', function () {
      let messageId;
      const returnedValue = 'test';
      const spanan = new Spanan(({ uuid }) => messageId = uuid);
      const promise = spanan.send().then((value) => {
        expect(value).to.equal(returnedValue);
      });
      spanan.dispatch({
        uuid: messageId,
        returnedValue
      });
      return promise;
    });

    it('removes callback after being called', function () {
      let messageId;
      const spanan = new Spanan(({ uuid }) => messageId = uuid);
      const promise = spanan.send();
      expect(spanan.callbacks.has(messageId)).to.equal(true);
      spanan.dispatch({
        uuid: messageId,
      });
      expect(spanan.callbacks.has(messageId)).to.equal(false);
    });
  });

  describe('.createProxy', function () {
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
});
