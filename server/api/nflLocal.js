const mariadb = require('mariadb');
const moment  = require('moment');
const express = require('express');
const router  = express.Router();
const pool    = mariadb.createPool(require('../config.json'));
var error   = { message: 'Error!', code: 0 };

async function queryDB(query, params, res){
  let conn;

  if (typeof(query) === 'undefined'){
    return false;
  }

  //eslint-disable-next-line
  //console.log('query', query);
  //eslint-disable-next-line
  //console.log('params', params);

  try {
    conn = await pool.getConnection();
    var rows = [];

    if(params !== false){
      rows = await conn.query(query, params);
    } else {
      rows = await conn.query(query);
    }

    
    //eslint-disable-next-line
    //console.log('NFLData', NFLData);

    conn.end();
    if(Array.isArray(rows)){      
      return rows;
    }

    return {
      'success': rows.affectedRows > 0 && rows.warningStatus === 0,
      'id': rows.insertId
    };

  } catch (err) {
    //eslint-disable-next-line
    console.log('err', err);
    res.json(err);
  } finally {
    if (conn) conn.end();
  }
}

router.post('/add/game/main', async (req, res) => {
  var gameData = req.body;
  var queryData = getKeysAndValues(gameData);

  let query = ` INSERT INTO nfl.games 
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/game/aggregate', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.games_aggregate 
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/game/defensive', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.games_defensive 
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/game/fumbles', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.games_fumbles 
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/game/kicking', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.games_kicking
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/game/passing', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.games_passing
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/game/punting', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.games_punting
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/game/receiving', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.games_receiving 
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/game/return', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.games_return 
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/game/rushing', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.games_rushing
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});


router.post('/add/team', async (req, res) => {
  var teamData = req.body;
  var queryData = getKeysAndValues(teamData);

  let query = ` INSERT INTO nfl.teams 
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

router.post('/add/player', async (req, res) => {
  var playerData = req.body;
  var queryData = getKeysAndValues(playerData);

  let query = ` INSERT INTO nfl.players 
                  (${queryData.keysSQL}) 
                VALUES (${queryData.valsSQL});`;

  return await queryDB(query, queryData.params, res);  
});

function getKeysAndValues(obj){
  var keys = Object.keys(obj).join(',');
  var vals = [];
  var params = {};

  Object.keys(obj).forEach((v) => {
    vals.push('?');
    params.push(obj[v]);
  });

  var valSQL = vals.join(',');
  return {
    params: params,
    keysSQL: keys,
    valsSQL: valSQL
  };
}