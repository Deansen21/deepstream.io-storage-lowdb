const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const events = require('events');
const pckg = require('../package.json');

class Connector extends events.EventEmitter {

  /* @param {Object} options Any options the connector needs to connect to the db and to configure it.
  *
  * @constructor
  */
  constructor(options) {
    super();
    this.isReady = false;
    this.name = pckg.name;
    this.version = pckg.version;
    this.dbfile = options.dbfile;

    this.adapter = new FileAsync(this.dbfile);
    this.db = low(this.adapter);
    this.db.read()
      .then(() => {
        this.isReady = true;
        this.emit('ready');
      });
  }

  /**
   * Writes a value to the connector.
   *
   * @param {String}   key
   * @param {Object}   value
   * @param {Function} callback Should be called with null for successful set operations or with an error message string
   *
   * @private
   * @returns {void}
   */
  set(key, value, callback) {
    this.db.set(key, value)
      .write()
      .then(() => {
        callback(null);
      })
      .catch((error) => {
        if (error.message) {
          callback(error.message);
        } else {
          callback(error);
        }
      });
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
    const value = this.db.get(key).value();
    callback(null, value);
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
    this.db.unset(key)
      .write()
      .then(() => {
        callback(null);
      })
      .catch((error) => {
        if (error.message) {
          callback(error.message);
        } else {
          callback(error);
        }
      });
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
