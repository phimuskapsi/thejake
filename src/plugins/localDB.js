// Do a bunch of local storage checks      
// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

if (!window.indexedDB) {
  alert('Your browser does not support this software. Please use a modern browser.');
}

const DB_NAME = 'xperimentalCode';
var DB_VERSION = 1;

if (localStorage.getItem('jakes-db-version')){ 
  let ver = localStorage.getItem('jakes-db-version');
  DB_VERSION = parseInt(ver) + 1;
}

import * as moment from 'moment';

export default class LocalDB {
  constructor () {
    this.db;    
    this.keyPath;
    this.objectStore;
    this.targetTable;

    this.now = moment();
  }

  set error (errorObj) {
    //eslint-disable-next-line  
    console.log('Error occured: ', errorObj);
    alert('An error has occured, please refer to the console log');
  }

  add(dataToStore = []) {
    var self = this;  
    var transaction;    
    
    transaction = self.db.transaction([self.targetTable], "readwrite");
    if (dataToStore.length > 0) {
      var objectStore = transaction.objectStore(self.targetTable);
      dataToStore.forEach((row) => {
        objectStore.add(row);        
      });
    }    
  }

  delete(targetTable = '', rowId = '') {

  }

  get(targetTable = '', keyPath = '', tableIndex = '') {
    
  }

  async init(targetTable = '', keyPath = '', tableIndex = '') {
    var self = this;
    var targetDB = await window.indexedDB.open(DB_NAME, DB_VERSION);

    if (targetTable !== '' && targetTable.length > 0 
        && keyPath !== '' && keyPath.length > 0) {
      
      self.db = targetDB;
      self.keyPath  = keyPath;
      self.targetTable = targetTable;   
      
      if (!self.db.objectStoreNames.contains('jakes')) {
        var jakesOS = self.db.createObjectStore('jakes', { keyPath: 'playerId' });
        jakesOS.createIndex('');
      }

      if (!self.db.objectStoreNames.contains('players')) {
        var playersOS = self.db.createObjectStore('players', { keyPath: 'id', autoIncrement: true });
        playersOS.createIndex('');
      }

      if (!self.db.objectStoreNames.contains('seasons')) {
        var seasonsOS = self.db.createObjectStore('seasons', { keyPath: 'id', autoIncrement: true });
        seasonsOS.createIndex('');
      }

      if (!self.db.objectStoreNames.contains('weeks')) {
        var weeksOS = self.db.createObjectStore('weeks', { keyPath: 'id', autoIncrement: true });
        weeksOS.createIndex('');
      }
    } // end top if

    
  }
}