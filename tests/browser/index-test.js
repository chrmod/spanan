import { expect } from 'chai';
import Spanan from '../../index';

describe('in same window', function () {
  describe('wraps message api', function () {
    let onMessage;
    let spanan;

    afterEach(function () {
      if (onMessage) {
        window.removeEventListener('message', onMessage);
      }
      onMessage = null;
      spanan.reset();
    });

    it('post message on Spanan call', function (done) {
      onMessage = function (ev) {
        try {
          const message = ev.data;
          expect(message).to.have.property('action').that.equals('echo');
          expect(message).to.have.property('args');
          expect(message).to.have.property('uuid');
          done();
        } catch (e) {
          done(e);
        }
      };
      window.addEventListener('message', onMessage);

      spanan = new Spanan((message) => {
        window.postMessage(message, '*');
      });
      spanan.send('echo');
    });

    it('call Spanan export on message', function (done) {
      onMessage = ev => spanan.handleMessage(ev.data);
      window.addEventListener('message', onMessage);

      spanan.export({
        echo() { done(); },
      });

      window.postMessage({
        action: 'echo',
      }, '*');
    });

    it('calls and receive response from exported functions', function () {
      spanan = new Spanan((message) => {
        window.postMessage({
          action: message.action,
          args: message.args,
          uuid: message.uuid,
        }, '*');
      });

      spanan.export({
        echo: r => r,
      }, {
        respond(response, request) {
          window.postMessage({
            uuid: request.uuid,
            response,
          }, '*');
        },
      });

      onMessage = ev => spanan.handleMessage(ev.data);

      window.addEventListener('message', onMessage);

      return spanan.send('echo', 'test').then((response) => {
        expect(response).to.equal('test');
      });
    });
  });
});
