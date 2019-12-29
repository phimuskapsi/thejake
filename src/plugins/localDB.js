import { openDB, deleteDB, wrap, unwrap } from 'idb';
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
    
    } // end top if

    
  }
}