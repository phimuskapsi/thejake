const mariadb = require('mariadb');
const moment  = require('moment');
const express = require('express');
const router  = express.Router();
const pool    = mariadb.createPool(require('../config.json'));
const NFLData = require('./nflData.js');
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

var addPlayerToDB = async (player, game, res) => {
  let query = ` INSERT INTO xcode.player_data 
                  (playerId, gameId, name, position, teamAbbr, season, week) 
                VALUES (?, ?, ?, ?, ?, ?, ?);`

  let statQuery = " INSERT INTO xcode.player_stats SET playerId = ?, gameId = ?, "
  let statParams = player.stats;
  var statInsert = [];
  let insertParams = [    
    player.playerId,
    game.id,
    player.name,
    'QB',
    player.team,
    game.year,
    game.week
  ];

  try {
    let playerRes = await queryDB(query, insertParams, res);
    //eslint-disable-next-line
    //console.log('playerRes', playerRes);
    if (playerRes.success) {
      statInsert = [ playerRes.id, game.id ];
      
      //eslint-disable-next-line
      //console.log('statParams', statParams);

      if (statParams) {
        for(let statKey in statParams) {             
          let v = statParams[statKey];
          statQuery += ` ${statKey} = ?,`;
          statInsert.push(v);
        }        

        // trim the comma
        statQuery = statQuery.trim();
        statQuery = statQuery.substr(0, statQuery.length - 1);

        //eslint-disable-next-line
        //console.log('statQuery', statQuery);

        await queryDB(statQuery, statInsert, res);
                          
      }      
    }
  } catch (err) {
    throw `Error when adding player: ${err.message}`;
  }
};

var getPlayerData = async (req, res) => {
  let params = [];
  let players = [];
  let where = '';
  let query = ` SELECT p.id as pid, p.gsisPlayerId, p.name, p.position, p.teamAbbr, p.image,
                       s.*
                FROM xcode.player_data p 
                  JOIN xcode.player_stats s ON s.playerId = p.id`;

  //eslint-disable-next-line
  console.log('req.params', req.params);
  //eslint-disable-next-line
  //console.log('NFLData', NFLData);
                  
  try {
    where = " WHERE ";
    if(typeof req.params.id !== 'undefined'){
      where += " p.gsisPlayerId = ? ";
      params.push(req.params.id);    
    }

    if (req.params.season) {
      if(typeof req.params.id !== 'undefined'){ 
        where += " AND "
      }

      where += " s.season = ?";
      params.push(req.params.season);
    }

    if (typeof req.params.week !== 'undefined') {
      where += " AND s.week = ?";
      params.push(req.params.week);
    }

    if (typeof req.params.name !== 'undefined') {
      where += " AND p.name = ?";
      params.push(req.params.name);
    }

    if (typeof req.params.team !== 'undefined') {
      where += " AND p.teamAbbr = ?";
      params.push(req.params.team);
    }
    query += where + " ORDER BY p.teamAbbr ";
    players = await queryDB(query, params);

    if (players.length > 0) {
      return players;
    } else {
      throw 'No players available based on available data. Try and refresh the db.';
    }
  } catch (err) {
    throw 'General error getting player data:' + err.message;
  }
};



router.get('/gsisStats/:id/:season?/:week?/:name?/:team?/:gsisPlayerId?', async (req, res) => {
  var players = await getPlayerData(req, res);
  if(players){
    res.json(players);
  } else {
    res.status(500).json(error);
  }
});

router.get('/stats/:season/:week/:name?/:team?', async (req, res) => {
  var players = await getPlayerData(req, res);
  if(players){
    res.json(players);
  } else {
    res.status(500).json(error);
  }
});

router.get('/jakes/history', async (req, res) => {
  var query = ` SELECT p.name, j.*,
                  s.gamesStarted, s.attempts, s.completions, s.passYards, s.passTds,
                  s.ints, s.sacks, s.rushAttempts, s.rushYards, s.rushTds, s.fumbles,
                  s.fumblesLost
                FROM xcode.jakes j
                    JOIN xcode.player_data p ON j.playerId = p.playerId AND j.gameId = p.gameId
                    JOIN xcode.player_stats s ON s.playerId = p.id
                WHERE s.win = 0
                ORDER BY j.season DESC, j.week DESC`;

  var history = await queryDB(query, [], res);
  if (history.length > 0) {
    res.json(history);
  } else {
    res.status(500).json(error);
  }
});

router.get('/jakes/:season/:week?/:name?/:team?', async (req, res) => {
  var players = await getJakes(req, res);
  if(players){
    res.json(players);
  } else {
    res.status(500).json(error);
  }
});

router.get('/calculateHistoricalJakes', async (req, res) => {
  var query = ` SELECT p.gameId, p.playerId, p.name, s.ints, s.fumblesLost, 
                  round(((s.ints + s.fumblesLost) * (1/6)) * 100, 2) as jakeScore             
                FROM xcode.player_data p
                    JOIN xcode.player_stats s ON s.playerId = p.id
                WHERE p.season = ? AND p.week = ? AND (s.ints > 0 OR s.fumblesLost > 0)
                ORDER BY jakeScore DESC                
  `;

  var seasonsQuery = `  SELECT DISTINCT p.season
                        FROM xcode.player_data p ORDER BY p.season`;

  var seasons = await queryDB(seasonsQuery, [], res);
  //eslint-disable-next-line
  //console.log('seasons', seasons);

  var minWeek = 1;
  var maxWeek = 17;
  var jakes   = [];
  try {
    for (let s=0;s<seasons.length;s++) {
      for (let w=minWeek;w<maxWeek;w++) {
        
        let season = seasons[s].season;
        var stats = await queryDB(query, [ season, w ], res);

        for (let st=0;st<stats.length;st++){
          var jake = stats[st];
          //eslint-disable-next-line
          //console.log('jake', jake);
          
          var jakeInsert = `  INSERT INTO xcode.jakes 
                                SET gameId = ?, playerId = ?, jakeScore = ?,
                                    jakeWin = 0, trueJake = 0, season = ?, week = ?
          `;

          var jakeParams = [ jake.gameId, jake.playerId, jake.jakeScore, season, w ];
          var jakeRes = await queryDB(jakeInsert, jakeParams, res);

          if (jakeRes.success) {
            jakes.push(jake);
          }
        }
      }
    }

    res.json({done: true, success: true, jakes: jakes});
  } catch (err) {
    res.status(500).json(error);
  }
  //players = await queryDB(query, params);
});

router.get('/refresh', async (req, res) => {
  var NFL = new NFLData();
  //var history = await NFL.getHistoricalDataFromAPI();
  var seasons = {};
  let maxYear = parseInt(moment().format('YYYY'));  
  let year = 2019;
  //eslint-disable-next-line
  //console.log('history received');
  //history = false;
  try {
    for (let y=year;y<=maxYear;y++) {
      let season = await NFL.getHistoricalDataFromAPI(y);
      //eslint-disable-next-line
      console.log(`season ${y} has started...`);

      //seasons.forEach(season => {
      for(let skey in season) {
        let week = season[skey];
        for (let w=0;w<week.length;w++) {
          let game = week[w];
          //eslint-disable-next-line
          //console.log('game', game);
          if (game.id !== -1) {
            let awayQB = game.away.QB;
            let homeQB = game.home.QB;
    
            addPlayerToDB(awayQB, game, res);
            addPlayerToDB(homeQB, game, res);
          }
        }
      }    

      console.log(`season ${y} has completed...`);
      //}); 
    }

    //eslint-disable-next-line
    //console.log('done fetching data');
    //eslint-disable-next-line
    //console.log('seasons', seasons);
    res.json({done: true, success: true});
  } catch (err) {
    res.status(500).json(error);
  }
});

module.exports = router;