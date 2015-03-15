'use strict';

var chai = require('chai');
var expect = chai.expect;
var Tokensearch = require('../lib/tokensearch');

describe('./lib/tokensearch.js - edge cases', function() {

  it('invalid constructor, no collectionKey', function() {
    //GIVEN
    var failed = false;
    try {
      //WHEN
      tokenSearch = new Tokensearch(null);
    } catch (ex) {
      failed = true;
    }
    //THEN
    expect(failed).to.be.true;
  });

  it('invalid constructor, null collection', function() {
    //GIVEN
    var failed = false;
    try {
      //WHEN
      tokenSearch = new Tokensearch(null, { collectionKey: 'name' });
    } catch (ex) {
      failed = true;
    }
    //THEN
    expect(failed).to.be.true;
  });

  it('invalid constructor, empty collection', function() {
    //GIVEN
    var failed = false;
    try {
      //WHEN
      tokenSearch = new Tokensearch([], { collectionKey: 'name' });
    } catch (ex) {
      failed = true;
    }
    //THEN
    expect(failed).to.be.true;
  });

});