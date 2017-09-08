/* global describe, it */
const { expect } = require('chai');
const Connector = require('../src/connector');
const { EventEmitter } = require('events');

const settings = { dbfile: '/tmp/lowdb-storage-connector-tests.json' };

describe('the message connector has the correct structure:', () => {
  let connector;

  it('throws an error if required connection parameters are missing', () => {
    expect(() => {
      new Connector('gibberish'); // eslint-disable-line
    }).to.throw();
  });

  it('creates the connector', (done) => {
    connector = new Connector(settings);
    expect(connector.isReady).to.equal(true);
    connector.on('ready', done);
  });

  it('implements the storage connector interface', () => {
    expect(connector.name).to.be.a('string');
    expect(connector.version).to.be.a('string');
    expect(connector.get).to.be.a('function');
    expect(connector.set).to.be.a('function');
    expect(connector.delete).to.be.a('function');
    expect(connector instanceof EventEmitter).to.equal(true);
  });

  it('retrieves a non existing value', (done) => {
    connector.get('someValue', (error, value) => {
      expect(error).to.equal(null);
      expect(value).to.equal(null);
      done();
    });
  });

  it('sets a value', (done) => {
    connector.set('someValue', { _d: { v: 10 }, firstname: 'Wolfram' }, (error) => {
      expect(error).to.equal(null);
      done();
    });
  });

  it('retrieves an existing value', (done) => {
    connector.get('someValue', (error, value) => {
      expect(error).to.equal(null);
      expect(value).to.deep.equal({ _d: { v: 10 }, firstname: 'Wolfram' });
      done();
    });
  });

  it('deletes a value', (done) => {
    connector.delete('someValue', (error) => {
      expect(error).to.equal(null);
      done();
    });
  });

  it('Can\'t retrieve a deleted value', (done) => {
    connector.get('someValue', (error, value) => {
      expect(error).to.equal(null);
      expect(value).to.equal(null);
      done();
    });
  });
});
