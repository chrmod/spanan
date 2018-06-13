import { expect } from 'chai';
import Spanan from '../../index';
import SpananServer from '../../server';

const message = { action: 'echo' };

describe('Export', function () {
  let spanan;

  beforeEach(function () {
    spanan = new Spanan();
  });

  afterEach(function () {
    spanan.reset();
  });

  describe('spanan.dispatch', function () {
    context('with export defined', function () {
      context('and message that matches export', function () {
        it('if export does not throw it returns true', function () {
          spanan.export({
            echo() {},
          });
          expect(spanan.handleMessage(message)).to.equal(true);
        });

        it('if export does throw it returns false', function () {
          spanan.export({
            echo() { throw new Error('error'); },
          });
          expect(spanan.handleMessage(message)).to.equal(true);
        });
      });
    });

    context('with no exports defined', function () {
      it('return false', function () {
        expect(spanan.handleMessage(message)).to.equal(false);
      });
    });

    context('with matching export that throws', function () {
      let api;
      let errorCallback;

      beforeEach(function () {
        api = spanan.export({
          echo() { throw new Error('error'); },
        }, {
          respondWithError() {
            errorCallback();
          },
        });
      });

      it('calls respondWithError callback', function (done) {
        errorCallback = done;
        api.dispatch(message);
      });
    });

    context('with matching export that return promise which rejects', function () {
      let api;
      let errorCallback;

      beforeEach(function () {
        api = spanan.export({
          echo() { return Promise.reject(); },
        }, {
          respondWithError() {
            errorCallback();
          },
        });
      });

      it('calls respondWithError callback', function (done) {
        errorCallback = done;
        api.dispatch(message);
      });
    });
  });

  describe('spanan.export', function () {
    it('returns serve object', function () {
      expect(spanan.export({})).to.be.instanceof(SpananServer);
    });

    context('after calling terminate on server', function () {
      it('does not respond', function (done) {
        this.timeout(50);
        setTimeout(done, 30);
        const server = spanan.export({
          echo() {
            done('should not happen');
          },
        });
        server.terminate();
        spanan.handleMessage(message);
      });
    });

    context('on matching message and rejecting filter', function () {
      it('does not respond', function (done) {
        this.timeout(50);
        setTimeout(done, 30);
        spanan.export({
          echo() {
            done('should not happen');
          },
        }, {
          filter() { return false; },
        });
        spanan.handleMessage(message);
      });
    });

    context('on unmatching message and matching transform', function () {
      it('does call function', function (done) {
        spanan.export({
          echo() {
            done();
          },
        }, {
          transform(request) {
            return {
              action: request.fn,
            };
          },
        });
        spanan.handleMessage({
          fn: message.action,
        });
      });

      it('does respond', function (done) {
        spanan.export({
          echo() {},
        }, {
          transform(request) {
            return {
              action: request.fn,
            };
          },
          respond() {
            done();
          },
        });
        spanan.handleMessage({
          fn: message.action,
        });
      });
    });
  });
});
