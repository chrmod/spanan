import Spanan from '../index';
import { expect } from 'chai';

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
            echo() {}
          });
          expect(
            Spanan.dispatch(message)
          ).to.equal(true);
        });

        it('if export does throw it returns false', function () {
          Spanan.export({
            echo() { throw 'error'; }
          });
          expect(
            Spanan.dispatch(message)
          ).to.equal(false);
        });
      });
    });

    context('with no exports defined', function () {
      it('return false', function () {
        expect(
          Spanan.dispatch(message)
        ).to.equal(false);
      });
    });

    context('with at least one matching export that does not throw', function () {
      beforeEach(function () {
        Spanan.export({
          echo() { throw 'error'; }
        });
        Spanan.export({
          echo() {}
        });
      });

      it('return true', function () {
        expect(
          Spanan.dispatch(message)
        ).to.equal(true);
      });
    });
  });
});
