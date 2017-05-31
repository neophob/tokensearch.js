(function TokensearchModule(global) {
'use strict';
/*
 * tokensearch.js: simple string token collection search
 *
 * (C) 2015 Michael Vogt
 * MIT LICENSE
 *
 */
 const Tokensearch = function(_collection, options) {
  if (!_collection || _collection.length===0) {
    throw new Error('Empty collection!');
  }
  this.collectionKeys = options.collectionKeys || Tokensearch.defaultOptions.collectionKeys;
  if (this.collectionKeys.length===0) {
    throw new Error('No collectionKeys defined!');
  }
  this.collection = _collection;
  options = options || {};
  this.delimiter = options.delimiter || Tokensearch.defaultOptions.delimiter;
  this.unique = options.unique || Tokensearch.defaultOptions.unique;
  this.maxFilterTokenEntries = options.maxFilterTokenEntries || Tokensearch.defaultOptions.maxFilterTokenEntries;
  this.defaultThreshold = options.threshold || Tokensearch.defaultOptions.threshold;
  this.searchAlgorithm = options.searchAlgorithm || Tokensearch.defaultOptions.searchAlgorithm;
  this.sortAlgorithm = options.sortAlgorithm || Tokensearch.defaultOptions.sortAlgorithm;
  this.postprocessAlgorithm = options.postprocessAlgorithm || Tokensearch.defaultOptions.postprocessAlgorithm;
};


Tokensearch.defaultOptions = {
  //split strings with a delimiters, can be a regex or a character
  delimiter: /[\s\-_:]+/,

  // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
  // (of both letters and location), a threshold of '1.0' would match anything.
  threshold: 0.7,

  // How many search tokens are considered
  maxFilterTokenEntries: 5,

  // search key
  collectionKeys: [],

  //the result just contains unique results (based on collection keys)
  unique: false,

  //used to pre-verify an entry
  preprocessCheck: function() {
    return true;
  },

  // search all 'needles' in the 'haystack', return a score for each function call
  searchAlgorithm: function(haystack, needles) {
    let score = 0;
    if (!haystack) {
      return score;
    }
    const arrayLength = needles.length;
    for (let i = 0; i < arrayLength; i++) {
      const needle = needles[i];
      const stringPos = haystack.indexOf(needle);
      if (stringPos > -1) {
        if (needle.length < 2) {
          score += 1;
        } else {
          if (haystack === needle) {
            score += 6;
          } else if (stringPos === 0) {
            score += 2;
          } else {
            score += 1;
          }
        }
      }
    }
    return score;
  },

  //postprocess all elements (=contains all elements with a score)
  postprocessAlgorithm: function(collection, maxScore, threshold) {
    const normalizedScore = 1 / maxScore;
    const result = [];
    const ids = [];
    collection.forEach((element) => {
      element.score = 1-element.score*normalizedScore;
      if (element.score <= threshold) {
        element.maxScore = maxScore;
        let id = '';
        this.collectionKeys.forEach(key => {
          id += '' + element.item[key];
        });

        if (this.unique) {
          if (ids.indexOf(id) === -1) {
            ids.push(id);
            result.push(element);
          }
        } else {
          result.push(element);
        }
      }
    });
    return result;
  },

  // sort the result array (=output of the postprocess step)
  sortAlgorithm: function(array) {
    return array.sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      if (a.item) {
        return a.item.name.localeCompare(b.item.name);
      }
      return 0;
    });
  }
};

Tokensearch.prototype.getElementSearchTokens = function(entry) {
  const a = this.collectionKeys
    .map((searchKey) => {
      return entry[searchKey]
        .trim()
        .toLowerCase()
        .split(this.delimiter);
    });
  return [].concat.apply([],a).filter(this._onlyUniqueEntries);
};

Tokensearch.prototype._onlyUniqueEntries = function(value, index, self) {
  return value && self.indexOf(value) === index;
};

/**
 * returns an sorted array of { 'item': OBJECT, 'score': score }
 * -item contains the input object
 * -score defines the match with the search term, 0 means perfect match, 1 means rubbish
 */
Tokensearch.prototype.search = function(token, options = {}) {
  const threshold = options.customThreshold || this.defaultThreshold;
  const preprocessCheck = options.preprocessCheck || Tokensearch.defaultOptions.preprocessCheck;
  const searchTokens = token
    .trim()
    .split(this.delimiter)
    .filter(this._onlyUniqueEntries)
    .slice(0, this.maxFilterTokenEntries)
    .map((entry) => {
      return entry.toLowerCase();
    });

  const calculateScores = this.collection
    .filter(preprocessCheck)
    .map((item) => {
      const dataEntryTokens = this.getElementSearchTokens(item);
      const score = dataEntryTokens.reduce((accumulator, dataEntryToken) => {
        return accumulator + this.searchAlgorithm(dataEntryToken, searchTokens);
      }, 0);
      return { item, score };
    })
    .filter((entryScore) => { return entryScore.item && entryScore.score; });

  const maxScore = calculateScores.reduce((accumulator, entry) => {
    return Math.max(accumulator, entry.score);
  }, 0);
  const result = this.postprocessAlgorithm(calculateScores, maxScore, threshold);
  return this.sortAlgorithm(result);
};

/**
 * search for a custom entry
 */
Tokensearch.prototype.findFirstExactMatch = function(cb) {
  if (typeof cb !== 'function') {
    return;
  }
  for (let i=0, len=this.collection.length; i < len; i++) {
    const entry = this.collection[i];
    if (cb(entry)) {
      return entry;
    }
  }
};



  // Export to Common JS Loader
  if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = Tokensearch;
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function() {
      return Tokensearch;
    });
  } else {
    // Browser globals (root is window)
    global.Tokensearch = Tokensearch;
  }

//inject (optional) window object into the IIFE function
})(this);
