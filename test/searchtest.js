'use strict';

const chai = require('chai');
const expect = chai.expect;
const Tokensearch = require('../lib/tokensearch');
const users = require('./users.json');
const dups = require('./dups.json');

describe('searchtest.js - dup use case', function() {

  it('no dup search', function() {
    //GIVEN
    const tokenSearch = new Tokensearch(dups, { unique: true, collectionKeys: ['name'] });
    //WHEN
    const result = tokenSearch.search('ADAPPA ASHRAY AMARNATH');
    //THEN
    expect(result.length).to.equal(1);
    expect(result[0]).to.deep.equal({
      item: {
        name: 'ADAPPA ASHRAY AMARNATH ',
        CML_rank: '64400',
        registrationNumber: '1001061',
        alloted: null
      },
      score: 0,
      maxScore: 18
    });
  });

  it('no dup search, multiple collection keys', function() {
    //GIVEN
    const tokenSearch = new Tokensearch(dups, { unique: true, collectionKeys: ['name', 'CML_rank'] });
    //WHEN
    const result = tokenSearch.search('ADAPPA ASHRAY AMARNATH');
    //THEN
    expect(result.length).to.equal(3);
    expect(result[0].score).to.equal(0);
    expect(result[0].item).to.exist;
    expect(result[0].item.name).to.have.string('ADAPPA');
  });

});

describe('searchtest.js - default usage', function() {
  //GIVEN
  let tokenSearch;

  beforeEach(function() {
    tokenSearch = new Tokensearch(users, { collectionKeys: ['name'] });
  });

  it('regular search', function() {
    //WHEN
    var result = tokenSearch.search('GUPTA');
    //THEN
    expect(result.length).to.equal(24);
    expect(result[0].score).to.equal(0);
    expect(result[0].item).to.exist;
    expect(result[0].item.name).to.have.string('GUPTA');
  });

  it('regular search, case insensitive', function() {
    //WHEN
    var result = tokenSearch.search('gupta');

    //THEN
    expect(result.length).to.equal(24);
    expect(result[0].item.name).to.have.string('GUPTA');
  });

  it('search non existing user', function() {
    //WHEN
    var result = tokenSearch.search('MICHAEL VOGT');

    //THEN
    expect(result.length).to.equal(0);
  });

  it('search exact match', function() {
    //WHEN
    var result = tokenSearch.search('PATEL DHRUVIN UDAYAN');

    //THEN
    expect(result.length).to.equal(29);
    expect(result[0].item.name).to.have.string('PATEL DHRUVIN UDAYAN');
  });

  it('search unique name, missing last character', function() {
    //WHEN
    var result = tokenSearch.search('PATE DHRUVI UDAYA');

    //THEN
    expect(result.length).to.equal(31);
    expect(result[1].item.name).to.have.string('PATEL DHRUVIN UDAYAN');
  });

  it('search unique name, threshold too big', function() {
    //WHEN
    var result = tokenSearch.search('PATE DHRUVI UDAYA', { customThreshold: -0.1 } );

    //THEN
    expect(result.length).to.equal(0);
  });

  it('search specific entry string', function() { //HORST5533
    //WHEN
    var result = tokenSearch.search('HORST', { delimiter: /[\s-]+/ } );

    //THEN
    expect(result.length).to.equal(1);
    expect(result[0].item.name).to.have.string('HORST-5533');
  });

  it('search specific entry number', function() { //HORST5533
    //WHEN
    var result = tokenSearch.search('5533', { delimiter: /[\s-]+/ } );

    //THEN
    expect(result.length).to.equal(1);
    expect(result[0].item.name).to.have.string('HORST-5533');
  });

  it('search specific entry, string whitespace number', function() { //HORST5533
    //WHEN
    var result = tokenSearch.search('ST 55', { delimiter: /[\s\-]+/ } );

    //THEN
    expect(result[0].item.name).to.have.string('HORST-5533');
  });

  it('search entry with a pre search check', function() {
    //WHEN
    var precheck = function(entry) {
      var cmlNumber = parseInt(entry.CML_rank);
      if (cmlNumber < 100) {
        return true;
      }
      return false;
    };
    var result = tokenSearch.search('PATE DHRUVI UDAYA', { preprocessCheck : precheck } );

    //THEN
    expect(result.length).to.equal(6);
    expect(result[0].item.CML_rank.length).to.be.below(3);
    expect(result[1].item.CML_rank.length).to.be.below(3);
    expect(result[2].item.CML_rank.length).to.be.below(3);
    expect(result[3].item.CML_rank.length).to.be.below(3);
    expect(result[4].item.CML_rank.length).to.be.below(3);
    expect(result[5].item.CML_rank.length).to.be.below(3);
  });

  it('use custom search function', function() {
    //WHEN
    var result = tokenSearch.findFirstExactMatch(function(entry) {
      if (entry.CML_rank === '1240' && entry.alloted === 'B4125') {
        return true;
      }
    });

    //THEN
    expect(result.name).to.equal('BHAT GOUTAM MANJANATH ');
  });

  it('use custom search function, missing parameter', function() {
    //WHEN
    var result = tokenSearch.findFirstExactMatch();

    //THEN
    expect(result).to.equal(undefined);
  });

});
