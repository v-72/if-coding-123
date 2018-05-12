var app = require('../app')
    ,chai = require('chai')
    ,expect = chai.expect
    ,assert = chai.assert;

 
describe('Setup Datasource', function() {
    it('should create user object', function() {
      var result = app.createUserObject(require('../data/accounts.json').users);
      expect(result).to.be.a('Object');
    });

    it('should create activity object', function() {
        var result = app.setupDataSource(require('../data/wondertel.json'), 'wondertel');
        expect(result).to.be.a('Object');
        expect(result).to.have.property('activity');
        expect(result.activity).to.be.a('Array');
        expect(result.activity[0]).to.have.property('type');
        expect(result.activity[0]).to.have.property('source');
        assert.lengthOf(result.activity, result.grants.length + result.revocations.length);
      });
});