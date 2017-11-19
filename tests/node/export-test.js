import { expect } from 'chai';
import Spanan from '../../index';
import SpananServer from '../../server';

const message = { action: 'echo' };

describe('Export', function () {
  afterEach(function () {
    Spanan.reset();
  });

  describe('Spanan.dispatch', function () {
    context('with export defined', function () {
      context('and message that matches export', function () {
        it('if export does not throw it returns true', function () {
          Spanan.export({
            echo() {},
          });
          expect(Spanan.dispatch(message)).to.equal(true);
        });

        it('if export does throw it returns false', function () {
          Spanan.export({
            echo() { throw new Error('error'); },
          });
          expect(Spanan.dispatch(message)).to.equal(false);
        });
      });
    });

    context('with no exports defined', function () {
      it('return false', function () {
        expect(Spanan.dispatch(message)).to.equal(false);
      });
    });

    context('with at least one matching export that does not throw', function () {
      beforeEach(function () {
        Spanan.export({
          echo() { throw new Error('error'); },
        });
        Spanan.export({
          echo() {},
        });
      });

      it('return true', function () {
        expect(Spanan.dispatch(message)).to.equal(true);
      });
    });
  });

  describe('Spanan.export', function () {
    it('returns serve object', function () {
      expect(Spanan.export({})).to.be.instanceof(SpananServer);
    });

    context('after calling terminate on server', function () {
      it('does not respond', function (done) {
        this.timeout(50);
        setTimeout(done, 30);
        const server = Spanan.export({
          echo() {
            done('should not happen');
          },
        });
        server.terminate();
        Spanan.dispatch(message);
      });
    });

    context('on matching message and rejecting filter', function () {
      it('does not respond', function (done) {
        this.timeout(50);
        setTimeout(done, 30);
        Spanan.export({
          echo() {
            done('should not happen');
          },
        }, {
          filter() { return false; },
        });
        Spanan.dispatch(message);
      });
    });

    context('on unmatching message and matching transform', function () {
      it('does call function', function (done) {
        Spanan.export({
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
        Spanan.dispatch({
          fn: message.action,
        });
      });

      it('does respond', function (done) {
        Spanan.export({
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
        Spanan.dispatch({
          fn: message.action,
        });
      });
    });
  });
});
