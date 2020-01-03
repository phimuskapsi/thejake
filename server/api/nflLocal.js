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
      success: rows.affectedRows > 0 && rows.warningStatus === 0,
      id: rows.insertId
    };

  } catch (err) {
    //eslint-disable-next-line
    console.log('err', err);
    res.json(err);
  } finally {
    if (conn) conn.end();
  }
}

router.get('/get/passing/:season/:week', async (req, res) => {
  try {
    var seasonsQuery = `SELECT g.* FROM games`;

    var seasons = await queryDB(seasonsQuery, [], res);
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/get/games/all', async (req, res) => {
  try {
    var gamesQuery = `SELECT g.* FROM nfl.games g WHERE g.season = 2019 ORDER BY g.gameId `;
    var games = await queryDB(gamesQuery, [], res);

    res.json({done: true, success: true, games: games });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/main', async (req, res) => {
  try {
    var gameData = req.body;
    var queryData = getKeysAndValues(gameData);

    let query = ` INSERT INTO nfl.games 
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/aggregate', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    let query = ` INSERT INTO nfl.games_aggregate 
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/defensive', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    let query = ` INSERT INTO nfl.games_defensive 
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/fumbles', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    let query = ` INSERT INTO nfl.games_fumbles 
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/kicking', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    let query = ` INSERT INTO nfl.games_kicking
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/passing', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    let query = ` INSERT INTO nfl.games_passing
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/punting', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    let query = ` INSERT INTO nfl.games_punting
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/receiving', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    let query = ` INSERT INTO nfl.games_receiving 
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/return', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    let query = ` INSERT INTO nfl.games_return 
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/rushing', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    let query = ` INSERT INTO nfl.games_rushing
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/game/score', async (req, res) => {
  try {
    var scoreData = req.body;
    var gamesQuery = getKeysAndValuesForUpdate(scoreData.game);
    var scoreQueryData = getKeysAndValues(scoreData.score);
    var id = scoreData.id;

    let gamesquery = `UPDATE nfl.games
                       SET ${gamesQuery.sql} 
                      WHERE id = ${id};`;

    await queryDB(gamesquery, gamesQuery.params, res);  

    let scorequery = `INSERT INTO nfl.games_score
                        (${scoreQueryData.keysSQL}) 
                      VALUES (${scoreQueryData.valsSQL});`;

    await queryDB(scorequery, scoreQueryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('add/jakes/', async (req, res) => {
  try {
    

    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/team', async (req, res) => {
  try {
    var teamData = req.body;
    //console.log('req.body:', req.body);
    var queryData = getKeysAndValues(teamData);
    //console.log('querydata:', queryData);
    //return queryData;

    let query = ` INSERT INTO nfl.teams 
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/player', async (req, res) => {
  try {
    var playerData = req.body;
    var queryData = getKeysAndValues(playerData);
    //return queryData;
    let query = ` INSERT INTO nfl.players 
                    (${queryData.keysSQL}) 
                  VALUES (${queryData.valsSQL});`;

    await queryDB(query, queryData.params, res);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/update/games', async (req, res) => {
  try {
    var teamData = req.body;
    var queryData = getKeysAndValues(teamData);

    
  } catch (err) {
    res.status(500).json(error);
  }
});

function getKeysAndValuesForUpdate(obj){
  //console.log(obj);
  //var keys = Object.keys(obj).join(',');
  //var vals = [];
  //var params = [];
  var keys = Object.keys(obj);
  var params = [];
  var updates = [];

  keys.forEach((k) => {
    let updateString = `${k} = ?`;
    updates.push(updateString);
    params.push(obj[k]);
  });

  return {
    sql: updates.join(","),
    params: params 
  };
}

function getKeysAndValues(obj){
  //console.log(obj);
  var keys = Object.keys(obj).join(',');
  var vals = [];
  var params = [];

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

module.exports = router;