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
    for(var s=2001;s<2020;s++) {
      let homePlayersQuery = `SELECT g.season, g.week, g.gameDate, score.homePointTotal, player.nflId, player.displayName, player.birthDate, team.nick,
                                pass.passingAttempts, pass.passingCompletions, pass.passingInterceptions, pass.passingSacked,
                                IF(g.season > 2008, fumble.fumblesLost, (fumble.fumbles - (fumble.teammateFumbleRecovery + fumble.opponentFumbleRecovery + fumble.fumblesOutbounds))) as calcFumLost
                              FROM nfl.games g
                                JOIN nfl.games_passing pass ON pass.gameId = g.gameId AND pass.teamId = g.homeTeamId
                                JOIN nfl.games_aggregate agg ON agg.gameId = g.gameId AND agg.teamId = g.homeTeamId                            
                                JOIN nfl.games_fumbles fumble ON fumble.gameId = g.gameId AND fumble.playerId = pass.playerId                            
                                JOIN nfl.games_score score ON score.gameId = g.gameId
                                JOIN nfl.players player ON player.nflId = pass.playerId and player.season = g.season
                                JOIN nfl.teams team ON team.teamId = pass.teamId
                              WHERE pass.passingAttempts > 7 AND pass.season = ${s} AND g.homeWin = 0 AND player.position = 'QB'
                              GROUP BY g.season, g.week, pass.gameId, pass.playerId
                              ORDER BY g.season, g.week`;

      let vPlayersQuery =   `SELECT g.season, g.week, g.gameDate, score.visitorPointTotal, player.nflId, player.displayName, player.birthDate, team.nick,
                              pass.passingAttempts, pass.passingCompletions, pass.passingInterceptions, pass.passingSacked,
                              IF(g.season > 2008, fumble.fumblesLost, (fumble.fumbles - (fumble.teammateFumbleRecovery + fumble.opponentFumbleRecovery + fumble.fumblesOutbounds))) as calcFumLost
                            FROM nfl.games g
                              JOIN nfl.games_passing pass ON pass.gameId = g.gameId AND pass.teamId = g.visitorTeamId
                              JOIN nfl.games_aggregate agg ON agg.gameId = g.gameId AND agg.teamId = g.visitorTeamId                            
                              JOIN nfl.games_fumbles fumble ON fumble.gameId = g.gameId AND fumble.playerId = pass.playerId                            
                              JOIN nfl.games_score score ON score.gameId = g.gameId
                              JOIN nfl.players player ON player.nflId = pass.playerId and player.season = g.season
                              JOIN nfl.teams team ON team.teamId = pass.teamId
                            WHERE pass.passingAttempts > 7 AND pass.season = ${s} AND g.visitorWin = 0 AND player.position = 'QB'
                            GROUP BY g.season, g.week, pass.gameId, pass.playerId
                            ORDER BY g.season, g.week`;                              

      let homeGameStats = await queryDB(homePlayersQuery, [], res);
      let vGameStats = await queryDB(vPlayersQuery, [], res);
      let jakes = {};
      var fumLost = 0;
      var ints = 0;
      var multiplier = 0;
      var jakeScore = 0;
      var birthDate = '';
      var gameDate = '';
      var isBirthday = false
      jakes[s] = {};

      for(var h=0;h<homeGameStats.length;h++) {
        let homeGamePlayer = homeGameStats[h];
        fumLost = homeGamePlayer.calcFumLost;
        ints = homeGamePlayer.passingInterceptions;
        multiplier = 1/6;
        jakeScore = (((fumLost + ints) * multiplier) * 100).toFixed(2);
        birthDate = moment(homeGamePlayer.birthDate);
        gameDate = moment(homeGamePlayer.gameDate);
        isBirthday = birthDate.format('MM-DD') === gameDate.format('MM-DD');

        if (jakeScore > 0) {        
          if(typeof(jakes[homeGamePlayer.season][homeGamePlayer.week]) === "undefined") jakes[homeGamePlayer.season][homeGamePlayer.week] = [];

          jakes[homeGamePlayer.season][homeGamePlayer.week].push({
            playerId: homeGamePlayer.playerId,
            fumblesLost: fumLost,
            interceptions: ints,
            jakeScore: jakeScore,
            isBirthday: isBirthday,
            season: homeGamePlayer.season, 
            week: homeGamePlayer.week
          });
        }
      }
      
      for(var v=0;v<vGameStats.length;v++) {
        let vGamePlayer = vGameStats[v];
        fumLost = vGamePlayer.calcFumLost;
        ints = vGamePlayer.passingInterceptions;
        multiplier = 1/6;
        jakeScore = (((fumLost + ints) * multiplier) * 100).toFixed(2);
        birthDate = moment(vGamePlayer.birthDate);
        gameDate = moment(vGamePlayer.gameDate);
        isBirthday = birthDate.format('MM-DD') === gameDate.format('MM-DD');

        if (jakeScore > 0) {
          if(typeof(jakes[vGamePlayer.season][vGamePlayer.week]) === "undefined") jakes[vGamePlayer.season][vGamePlayer.week] = [];

          jakes[vGamePlayer.season][vGamePlayer.week].push({
            playerId: vGamePlayer.playerId,
            fumblesLost: fumLost,
            interceptions: ints,
            jakeScore: jakeScore,
            isBirthday: isBirthday
          });
        }
      }

      if (Object.keys(jakes).length > 0) {
        for(var season in jakes) {
          for(var seasonWeeks in jakes[season]) {
            var playerData = jakes[season][seasonWeeks];
            var queryData = getKeysAndValues(playerData);

            let query = ` INSERT INTO nfl.games_jakes
                            (${queryData.keysSQL}) 
                          VALUES (${queryData.valsSQL});`;
        
            await queryDB(query, queryData.params, res);  
          } // End jakes insert loop
        } // End seasons of jakes
      } // End jakes if
    } // End Season Loop                

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