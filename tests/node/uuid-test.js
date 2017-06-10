import { expect } from 'chai';
import uuid from '../uuid';

describe('uuid', function () {
  it('returns new uuid on every call', function () {
    expect(uuid()).to.not.be.equal(uuid());
  });

  it('returns a valid uuid v4', function () {
    expect(uuid()).to.have.property('length', 36);
  });
});
