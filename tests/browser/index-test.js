import { expect } from 'chai';
import Spanan from '../index';

describe('in same window', function () {
  describe('wraps message api', function () {
    let onMessage;

    afterEach(function () {
      if (onMessage) {
        window.removeEventListener('message', onMessage);
      }
      onMessage = null;
      Spanan.reset();
    });

    it('post message on Spanan call', function (done) {
      onMessage = function (ev) {
        try {
          const message = ev.data;
          expect(message).to.have.property('functionName').that.equals('echo');
          expect(message).to.have.property('args');
          expect(message).to.have.property('uuid');
          done();
        } catch(e) {
          done(e);
        }
      };
      window.addEventListener('message', onMessage);

      const spanan = new Spanan((message) => {
        window.postMessage(message, '*');
      });
      const proxy = spanan.createProxy();
      proxy.echo();
    });

    it('call Spanan export on message', function (done) {
      onMessage = ev => Spanan.dispatch(ev.data);
      window.addEventListener('message', onMessage);

      Spanan.export({
        echo() { done(); }
      });

      window.postMessage({
        action: 'echo',
      }, '*');
    });

    it('calls and receive response from exported functions', function () {
      onMessage = ev => Spanan.dispatch(ev.data);
      window.addEventListener('message', onMessage);

      Spanan.export({
        echo: r => r,
      }, {
        respond(response, request) {
          window.postMessage({
            uuid: request.uuid,
            returnedValue: response,
          }, '*');
        }
      });

      const spanan = new Spanan((message) => {
        window.postMessage({
          action: message.functionName,
          args: message.args,
          uuid: message.uuid,
        }, '*');
      });
      const proxy = spanan.createProxy();
      return proxy.echo('test').then(response => {
        expect(response).to.equal('test');
      });
    });
  });

});
