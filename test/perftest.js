'use strict';

const chai = require('chai');
const expect = chai.expect;
const Tokensearch = require('../lib/tokensearch');

describe('perftest.js - ', function() {

  function createDummyData(numberOfEntries) {
    return Array.from(Array(numberOfEntries)).map((unused, index) => {
      return {
        type: 'type'+index,
        manufacturer: 'manufacturer'+index,
        name: 'name'+index,
        generic: false
      };
    });
  }

  [50, 500, 5000, 50000].forEach((numberOfEntries) => {
    it('simple search, entries '+numberOfEntries, function() {
      //GIVEN
      const data = createDummyData(numberOfEntries);
      const tokenSearch = new Tokensearch(data, { collectionKeys: ['type', 'manufacturer', 'name'], delimiter: /[\s:_\-\/]+/, maxFilterTokenEntries: 6, threshold: 0.5 });
      //WHEN
      const startTs = Date.now();
      tokenSearch.search('e a');
      //THEN
      const durationMs = Date.now() - startTs;
      console.log('duration (ms)', durationMs);
      expect(durationMs < 10000).to.equal(true);
    });
  });


  function preprocessCheck(entry) {
    return !entry.generic;
  }

  [50, 500, 5000, 50000].forEach((numberOfEntries) => {
    it('search with preprocessCheck, entries '+numberOfEntries, function() {
      //GIVEN
      const data = createDummyData(numberOfEntries);
      const tokenSearch = new Tokensearch(data, { collectionKeys: ['type', 'manufacturer', 'name'], delimiter: /[\s:_\-\/]+/, maxFilterTokenEntries: 6, threshold: 0.5 });
      //WHEN
      const startTs = Date.now();
      tokenSearch.search('e a', { preprocessCheck });
      //THEN
      const durationMs = Date.now() - startTs;
      console.log('duration (ms)', durationMs);
      expect(durationMs < 10000).to.equal(true);
    });
  });

});


/*
duration (ms) 3
    ✓ search in 50
duration (ms) 10
    ✓ search in 500
duration (ms) 95
    ✓ search in 5000 (101ms)
duration (ms) 940
    ✓ search in 50000 (985ms)


        osx + new       a20 + old       a20 + new
 50:    3               13              51 (3)
 500:   10              96              243 (24)
 5000:  95              786             1735 (196)
 50000: 940             9616            19820 (2033)



 duration (ms) 2
    ✓ search in 50
duration (ms) 8
    ✓ search in 500
duration (ms) 82
    ✓ search in 5000 (86ms)
duration (ms) 761

duration (ms) 3
    ✓ search in 50
duration (ms) 7
    ✓ search in 500
duration (ms) 80
    ✓ search in 5000 (84ms)
duration (ms) 832

PATRICK
duration (ms) 3
    ✓ search in 50
duration (ms) 11
    ✓ search in 500
duration (ms) 108
    ✓ search in 5000 (116ms)
duration (ms) 1040



duration (ms) 3
    ✓ search in 50
duration (ms) 24
    ✓ search in 500 (56ms)
duration (ms) 196
    ✓ search in 5000 (268ms)
duration (ms) 2046

*/
