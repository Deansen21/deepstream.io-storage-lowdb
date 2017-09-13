const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');

const { EventEmitter } = require('events');
const pckg = require('../package.json');

class Connector extends EventEmitter {
  /* @param {Object} options Any options the connector needs to connect to the db and
  * to configure it.
  *
  * @constructor
  */
  constructor(options) {
    super();
    this.isReady = false;
    this.name = pckg.name;
    this.version = pckg.version;
    if (!options.dbFile) {
      throw new TypeError('options dbFile is required');
    }
    this.dbFile = options.dbFile;

    if (options.dbBackupFile) {
      this.dbBackupFile = options.dbBackupFile;
    }

    this.adapter = new FileSync(this.dbFile);
    this.db = low(this.adapter);
    this.db.read();
    this.isReady = true;
    process.nextTick(() => this.emit('ready'));
  }

  _write() {
    this.db.write();
    if (this.dbBackupFile) {
      const unit = this.db.get('unit').value();
      fs.writeFileSync(this.dbBackupFile, JSON.stringify({ unit }, null, 2));
    }
  }

  /**
   * Writes a value to the connector.
   *
   * @param {String}   key
   * @param {Object}   value
   * @param {Function} callback Should be called with null for successful set operations or with an
   * error message string
   *
   * @private
   * @returns {void}
   */
  set(key, value, callback) {
    this.db.set(key, value);
    this._write();
    callback(null);
  }

  /**
   * Retrieves a value from the connector.
   *
   * @param {String}   key
   * @param {Function} callback Will be called with null and the stored object
   *                            for successful operations or with an error message string
   *
   * @returns {void}
   */
  get(key, callback) {
    if (this.db.has(key)) {
      const value = this.db.get(key).value();
      callback(null, value === undefined ? null : value);
    } else {
      callback(null, null);
    }
  }

  /**
   * Deletes an entry from the connector.
   *
   * @param   {String}   key
   * @param   {Function} callback Will be called with null for successful deletions or with
   *                     an error message string
   *
   * @returns {void}
   */
  delete(key, callback) {
    this.db.unset(key);
    this._write();
    callback(null);
  }

  /**
   * Gracefully close the connector and any dependencies.
   *
   * Called when deepstream.close() is invoked.
   * If this method is defined, it must emit 'close' event to notify deepstream of clean closure.
   *
   * (optional)
   *
   * @public
   * @returns {void}
   */
  close() {
    this.emit('close');
  }
}

module.exports = Connector;
