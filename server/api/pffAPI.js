const mariadb = require('mariadb');
const moment  = require('moment');
const express = require('express');
const router  = express.Router();
const pool    = mariadb.createPool(require('../config.json'));
const fetch = require("node-fetch");
const { weekdaysMin } = require('moment');
const { query } = require('express');
var error   = { message: 'Error!', code: 0 };

Object.prototype.clone = Array.prototype.clone = function()
{
    if (Object.prototype.toString.call(this) === '[object Array]')
    {
        var clone = [];
        for (var i=0; i<this.length; i++)
            clone[i] = this[i].clone();

        return clone;
    } 
    else if (typeof(this)=="object")
    {
        var clone = {};
        for (var prop in this)
            if (this.hasOwnProperty(prop))
                clone[prop] = this[prop].clone();

        return clone;
    }
    else
        return this;
}

function getKeysAndValuesForUpdate(obj){
  //console.log(obj);
  //var keys = Object.keys(obj).join(',');
  //var vals = [];
  //var params = [];
  var keys = Object.keys(obj);
  var params = [];
  var updates = [];

  keys.forEach((k) => {
    if(k === 'id' || k === 'season' || k === 'week') {
      return;
    }
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

async function parseESPNGames(espnData, season, week) {
  var games = espnData.events;
  var parsedGames = [];
  for(var g=0;g<games.length;g++) {
    var game = games[g].competitions[0];
    var home_key = game.competitors[0].homeAway === 'home' ? 0 : 1;
    var away_key = home_key === 0 ? 1 : 0;
    var away_team = game.competitors[away_key].team; // id, location, name, abbreviation, displayName, shortDisplayName, color, alternateColor, isActive
    var home_team = game.competitors[home_key].team;
    var winner = game.competitors[home_key].winner ? 'home' : 'away';
    var away_score = game.competitors[away_key].score;
    var home_score = game.competitors[home_key].score;

    if(away_score === home_score) winner = 'tie';  
    try{     
      if(away_team.abbreviation === 'WSH') away_team.abbreviation = 'WAS';
      if(home_team.abbreviation === 'WSH') home_team.abbreviation = 'WAS';
      if(away_team.abbreviation === 'LAR') away_team.abbreviation = 'LA';
      if(home_team.abbreviation === 'LAR') home_team.abbreviation = 'LA';
      if(away_team.abbreviation === 'CLE') away_team.abbreviation = 'CLV';
      if(home_team.abbreviation === 'CLE') home_team.abbreviation = 'CLV';
      if(away_team.abbreviation === 'BAL') away_team.abbreviation = 'BLT';
      if(home_team.abbreviation === 'BAL') home_team.abbreviation = 'BLT';
      if(away_team.abbreviation === 'HOU') away_team.abbreviation = 'HST';
      if(home_team.abbreviation === 'HOU') home_team.abbreviation = 'HST';
      if(away_team.abbreviation === 'ARI') away_team.abbreviation = 'ARZ';
      if(home_team.abbreviation === 'ARI') home_team.abbreviation = 'ARZ';

      var teamIdAR = await fetch(`http://lvh.me:3000/api/v1/get/pff/team/${away_team.abbreviation}/${season}`);
      var teamIdAJ = await teamIdAR.json();       
      
      if(!teamIdAJ.team[0]) console.log(away_team);

      var awayteamId = teamIdAJ.team[0].franchise_id;

      var teamIdHR = await fetch(`http://lvh.me:3000/api/v1/get/pff/team/${home_team.abbreviation}/${season}`);
      var teamIdHJ = await teamIdHR.json();

      if(!teamIdHJ.team[0]) console.log(home_team);
      var hometeamId = teamIdHJ.team[0].franchise_id;
      var game = {
        score_away: away_score,
        score_home: home_score,
        winner: winner,
        winner_id: (winner === 'tie' ? 0 : winner === 'away' ? awayteamId : hometeamId),
        loser_id: (winner === 'tie' ? 0 : winner === 'away' ? hometeamId : awayteamId),
        away_team_id: awayteamId,
        home_team_id: hometeamId,
        week: week,
        season: season
      };

      parsedGames.push(game);
    } catch(err) {
      console.log('error:', err);
      return err;
    }
  }

  return parsedGames;
}

async function parseYahooPassers(yahooData, season, week) {
  var players = yahooData.data.leagues[0].leagueWeeks[0].leaders;
  var parsedPlayers = [];

  for(var p=0;p<players.length;p++) {
    var player = players[p].player;
    var player_stats_pre = players[p].stats;
    var player_stats = {};

    player_stats_pre.forEach((stat) => {
      player_stats[stat.statId] = stat.value;
    });

    if(player.team.abbreviation === 'WSH') player.team.abbreviation = 'WAS';
    if(player.team.abbreviation === 'LAR') player.team.abbreviation = 'LA';
    if(player.team.abbreviation === 'CLE') player.team.abbreviation = 'CLV';
    if(player.team.abbreviation === 'BAL') player.team.abbreviation = 'BLT';
    if(player.team.abbreviation === 'HOU') player.team.abbreviation = 'HST';
    if(player.team.abbreviation === 'ARI') player.team.abbreviation = 'ARZ';

    var teamId = 0;
    if(season >= 2020) {
      var teamIdR = await fetch(`http://lvh.me:3000/api/v1/get/pff/team/${player.team.abbreviation}/${season}`);
      var teamIdJ = await teamIdR.json();
      teamId = teamIdJ.team[0].franchise_id;
    }

    var search_name = player.displayName.split(' ')[0] + ' ' + player.displayName.split(' ')[1];
    var player_name_resp = await fetch(`http://lvh.me:3000/api/v1/get/player/name/`, {
      method: 'post',              
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: search_name, season: season, week: week })
    });

    var player_name_json = await player_name_resp.json();
    if(!player_name_json || !player_name_json.player || !player_name_json.player.pff_id) {
      console.log('name:', search_name);
    }

    var player_id = player_name_json.player.pff_id;
    var parsedPlayer = {
      id: 0,
      ints: player_stats.PASSING_INTERCEPTIONS,
      fumbles: player_stats.FUMBLES_LOST,
      att: player_stats.PASSING_ATTEMPTS,
      comp: player_stats.PASSING_COMPLETIONS,
      player: player.displayName,
      player_id: player_id,
      rush_carries: 0,
      rush_tds: 0,
      rush_yds: 0,
      tds: player_stats.PASSING_TOUCHDOWNS,
      sacks: player_stats.SACKS_TAKEN,
      team: player.team.abbreviation,
      team_id: teamId,
      season: season,
      week: week,
      qbr: player_stats.QB_RATING,
      ypa: player_stats.PASSING_YARDS_PER_ATTEMPT,
      comp_per: player_stats.COMPLETION_PERCENTAGE,
      yds: player_stats.PASSING_YARDS,
      jake_score: (parseInt(player_stats.PASSING_INTERCEPTIONS) + parseInt(player_stats.FUMBLES_LOST)) * 1/6,
      ultimate_score: await calculateUltimate(player_stats, player.displayName, season)
    };

    parsedPlayers.push(parsedPlayer);
  }

  return parsedPlayers;
}

function parseYahooRushers() {

}

async function calculateUltimate(player_stats, player, season) {
  var comp_per = player_stats.COMPLETION_PERCENTAGE;
  var yards = player_stats.PASSING_YARDS;
  var att = player_stats.PASSING_ATTEMPTS;
  var comp = player_stats.PASSING_COMPLETIONS;
  var td = player_stats.PASSING_TOUCHDOWNS;
  var int = player_stats.PASSING_INTERCEPTIONS;
  var sacks = player_stats.SACKS_TAKEN;
  var fumbles = player_stats.FUMBLES_LOST;
  var qbr = player_stats.QB_RATING;
  var jake = ((parseInt(player_stats.PASSING_INTERCEPTIONS) + parseInt(player_stats.FUMBLES_LOST)) * 1/6) * 100;
  var perfect = 1075;
  var birthday_score = 10000;
  var ultimate = 0;
  // Idea is that a perfect jake is 1075 + 10000 = 11075 (jan 10, 1975 - delhomme's bday!)
  // Jake score makes up the majority.
  ultimate += jake * 5; // up to 500 (or more theoretically)
  
  // Sacks add 100 more. If 10 or more, 100
  ultimate += (sacks > 10 ? 100 : sacks * 10);

  // In this case, this will flip qbr upside down.
  // A 0.00 qbr (1.00) = 158.3 points, and a 158.3 qbr = 1 point;
  // It multiplies the result to get a value max of 300;
  if(qbr === 0) qbr = 1;
  ultimate +=  Math.ceil(((1/qbr)*158.3)*1.895);
  
  // TD's work like sacks in reverse, 0 td's = no subtraction, perfect is achievable.
  ultimate -= (td > 10 ? 100 : td * 10);

  // ints add 100 more. If 10 or more, 100
  // Yes, I'm double dipping. I make the rules.
  ultimate += (int > 10 ? 100 : int * 10);

  // 1000 only gets us soooo far.
  ultimate += 75;

  var game_day = moment(player_stats.game_date).format('MM-DD');
  var bday = moment(player_stats.birthday, 'YYYY-MM-DD').format('MM-DD');

  if(bday === game_day) {
    ultimate += birthday_score;
  }

  if(ultimate > (perfect + birthday_score)) {
    ultimate = perfect + birthday_score;
  }

  return ultimate;  
}

async function updateCurrentWeek(season, week = 0) {
  try {
    if(season >= 2020) {
      var espn_current_stats_r = await fetch(`http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`);      
      var espn_current_stats = await espn_current_stats_r.json();
      var espn_parsed_games = await parseESPNGames(espn_current_stats, season, week);

      var l_games_resp = await fetch(`http://lvh.me:3000/api/v1/get/pff/games/${season}/${cweek}`);
      var l_games_json = await l_games_resp.json();
      var l_games = l_games_json.games;

      // Then update games
      for(var pfg=0;pfg<espn_parsed_games.length;pfg++) {
        var local_game = false;
        var espn_game = espn_parsed_games[pfg];
        //console.log('eg:', espn_game);
        var lgindex = l_games.findIndex((game) => {
          return game.away_team_id === espn_game.away_team_id && game.home_team_id === espn_game.home_team_id
        });
        
        //console.log('lgi:', lgindex);

        if(lgindex >= 0) {
          local_game = l_games[lgindex];
        }
      
        //console.log('local game:', local_game);
        var insertGame = espn_game;
        var url = '';
        if(local_game) {
          insertGame.id = local_game.id;
          url = `http://lvh.me:3000/api/v1/update/pff/game/score`;
        } else {
          url = `http://lvh.me:3000/api/v1/add/pff/game`;
        }
        
        var updated_game_resp = await fetch(url, {
          method: 'post',              
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(insertGame)
        });

        var updatedGame = await updated_game_resp.json();            
      }     
    }

    // Then we have data and need to update instead of insert.
    var cweek = 0;
    if(espn_current_stats) {
      cweek = espn_current_stats.week.number;
    }

    if(week > 0){
      cweek = week;
    }

    var l_games_resp = await fetch(`http://lvh.me:3000/api/v1/get/pff/games/${season}/${cweek}`);
    var l_games_json = await l_games_resp.json();
    var l_games = l_games_json.games;

    var l_players_resp = await fetch(`http://lvh.me:3000/api/v1/get/pff/players/${season}/${cweek}`);
    var l_players_json = await l_players_resp.json();      
    var l_players = l_players_json.qbs;
    
    var yahoo_current_pstats_r = await fetch(`https://graphite-secure.sports.yahoo.com/v1/query/shangrila/weeklyStatsFootballPassing?season=${season}&league=nfl&sortStatId=PASSING_INTERCEPTIONS&week=${cweek}&count=200`);
    var yahoo_current_pstats = await yahoo_current_pstats_r.json();
    var yahoo_parsed_pstats = await parseYahooPassers(yahoo_current_pstats, season, week, l_games);
    
    // OK, we need to update players and games, if they match - we don't care if they changed, just update anyway.
    // Player Update first.      

    for(var pfp=0;pfp<yahoo_parsed_pstats.length;pfp++) {
      var local_player = false;
      var yahoo_player_pass = yahoo_parsed_pstats[pfp];
      var url = '';
      var lpindex = l_players.findIndex((player) => {
        return player.player === yahoo_player_pass.player
      });

      if(lpindex >= 0) {
        local_player = l_players[lpindex];
      }

      if(local_player) {
        yahoo_player_pass.id = local_player.id;
        url = `http://lvh.me:3000/api/v1/update/pff/week/`;
      } else {
        url = `http://lvh.me:3000/api/v1/add/pff/week`;
      }

      var updated_resp = await fetch(url, {
        method: 'post',              
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(yahoo_player_pass)
      });

      var updatedPlayer = await updated_resp.json();        
    }       
    
    
    

    return {success: true, msg: 'probably updated...'};
  } catch (err) {
    //eslint-disable-next-line
    console.log('error:', err);
    return err;
  }
}

async function queryDB(query, params){
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
    //console.log('rows', rows);

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
  } finally {
    if (conn) conn.end();
  }
}

router.post('/add/pff/player/', async (req, res) => {
  try {
    var playerData = req.body;
    var insertPFFData = getKeysAndValues(playerData);
    let insertPFFQuery = `INSERT INTO nfl.pff_players
                            (${insertPFFData.keysSQL}) 
                          VALUES (${insertPFFData.valsSQL});`;

    var inserted = await queryDB(insertPFFQuery, insertPFFData.params);  
    res.json({done: true, success: inserted.success, id: inserted.id });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/pff/game', async (req, res) => {
  try {
    var weekData = req.body;
    var insertPFFData = getKeysAndValues(weekData);
    let insertPFFQuery = `INSERT INTO nfl.pff_games
                            (${insertPFFData.keysSQL}) 
                          VALUES (${insertPFFData.valsSQL});`;

    await queryDB(insertPFFQuery, insertPFFData.params);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/nfl/player', async (req, res) => {
  try {
    var playerData = req.body;
    var insertPFFData = getKeysAndValues(playerData);

    var pquery = ` SELECT COUNT(*) as listed FROM nfl.pff_players WHERE nfl_id = ${playerData.nfl_id}`;
    var pcountres = await queryDB(pquery, []);
    var pcount = pcountres[0] && pcountres[0].listed ? parseInt(pcountres[0].listed) > 0 : false;

    if(!pcount) {
      let insertPFFQuery = `INSERT INTO nfl.pff_players
                              (${insertPFFData.keysSQL}) 
                            VALUES (${insertPFFData.valsSQL});`;

      await queryDB(insertPFFQuery, insertPFFData.params);  
    }
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/pff/team', async (req, res) => {
  try {
    var weekData = req.body;
    var insertPFFData = getKeysAndValues(weekData);
    let insertPFFQuery = `INSERT INTO nfl.pff_teams
                            (${insertPFFData.keysSQL}) 
                          VALUES (${insertPFFData.valsSQL});`;

    await queryDB(insertPFFQuery, insertPFFData.params);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/add/pff/week', async (req, res) => {
  try {
    var weekData = req.body;
    var insertPFFData = getKeysAndValues(weekData);
    let insertPFFQuery = `INSERT INTO nfl.pff_qb_stats
                            (${insertPFFData.keysSQL}) 
                          VALUES (${insertPFFData.valsSQL});`;

    await queryDB(insertPFFQuery, insertPFFData.params);  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/fix/pff/teams/', async (req,res) => {
  try {
    
    var pff_teams_response = await fetch(`https://premium.pff.com/api/v1/teams?season=${this.season}&league=nfl`);      
    var pff_teams_data = await pff_teams_response.json();
    //console.log('wd:', pff_teams_data);
    var pff_teams = pff_teams_data.teams;
    var pff_divisions = pff_teams_data.franchise_groups;

    for(var t=0;t<pff_teams.length;t++) {

    }

    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/fix/nfl/teams/', async (req, res) => {
  try {
    var pff_teams_query = 'SELECT * FROM nfl.pff_teams WHERE season = 2020 and franchise_id = 32';    
    var pff_teams = await queryDB(pff_teams_query, []);
    
    var nfl_teams_static_query = 'SELECT * FROM nfl.teams WHERE season = 2019 and teamId = 5110';
    var nfl_teams_defaults = await queryDB(nfl_teams_static_query);

    //console.log('pff_teams', pff_teams.length);

    if(nfl_teams_defaults.length > 0 && pff_teams.length > 0) {
      for(var n=0;n<nfl_teams_defaults.length;n++) {
        var nfl_team = nfl_teams_defaults[n];
        //console.log('nfl_team', nfl_team);
        var pff_team_index = pff_teams.findIndex((v, i) => { return v.nickname === nfl_team.nick })
        //console.log('pff_team_index', pff_team_index);
        var pff_team = pff_teams[pff_team_index];

        for(s=2008;s<2019;s++) {
          var team_update = {
            season: s,
            teamId: nfl_team.teamId,
            abbr: nfl_team.abbr,
            cityState: pff_team.city,
            fullName: pff_team.city + ' ' + pff_team.nickname,
            nick: pff_team.nickname,
            conferenceAbbr: nfl_team.conferenceAbbr,
            divisionAbbr: nfl_team.divisionAbbr
          };

          let insertPFFQuery = `UPDATE nfl.pff_teams SET abbreviation = '${nfl_team.abbr}'
                                WHERE season = ${s} AND nickname = '${nfl_team.nick}'`;
          var pff_inserted = await queryDB(insertPFFQuery);

          var insertNFLData = getKeysAndValues(team_update);
          let insertNFLQuery = `INSERT INTO nfl.teams
                                  (${insertNFLData.keysSQL}) 
                                VALUES (${insertNFLData.valsSQL});`;
          var nfl_inserted = await queryDB(insertNFLQuery, insertNFLData.params);             
          if(pff_inserted && nfl_inserted) console.log('added: ' + nfl_team.nick + ' season: ' + s);
        }
      }
    }
  
    res.json({done: true, success: true });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/get/pff/games/:season/:week', async (req, res) => {
  try {
    var gamesQ = `SELECT g.*,
                    (SELECT t.abbreviation FROM nfl.pff_teams t WHERE t.franchise_id = g.away_team_id and t.season = g.season) as away_team,
                    (SELECT t.abbreviation FROM nfl.pff_teams t WHERE t.franchise_id = g.home_team_id and t.season = g.season) as home_team
                  FROM nfl.pff_games g
                  WHERE g.season = ${req.params.season} AND g.week = ${req.params.week}`;
    var games = await queryDB(gamesQ, []);
    res.json({done: true, success: true, games: games });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/get/pff/player_list_ids/', async (req, res) => {
  try {
    
    var qbsquery = `SELECT DISTINCT p.player_id, p.player FROM nfl.pff_qb_stats p`;
    var qbs = await queryDB(qbsquery, []);
    res.json({done: true, success: true, qbs: qbs });
  
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/get/pff/player_list/:season/', async (req, res) => {
  try {
    if (req.params.season) {
      var qbsquery = `SELECT DISTINCT p.player FROM nfl.pff_qb_stats p WHERE p.season = ${req.params.season} GROUP BY player`;
      var qbs = await queryDB(qbsquery, []);
      res.json({done: true, success: true, qbs: qbs });
    } else {
      var qbsquery = `SELECT DISTINCT p.player_id, p.player FROM pff_qb_stats p`;
      var qbs = await queryDB(qbsquery, []);
      res.json({done: true, success: true, qbs: qbs });
    }
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/get/pff/players/:season/:week', async (req, res) => {
  try {
    var qbsquery = `SELECT p.* FROM nfl.pff_qb_stats p WHERE p.season = ${req.params.season} AND p.week = ${req.params.week}`;
    var qbs = await queryDB(qbsquery, []);
    res.json({done: true, success: true, qbs: qbs });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/get/pff/stats/', async (req, res) => {
  try {
    var qbsquery = `  SELECT p.*, pl.birthday, g.game_date
                      FROM nfl.pff_qb_stats p 
                        JOIN nfl.pff_players pl ON p.player_id = pl.pff_id 
                        JOIN nfl.pff_games g ON g.season = p.season and g.week = p.week and (g.away_team_id = p.team_id OR g.home_team_id = p.team_id)
                      ORDER BY p.season, p.week`;
    var qbs = await queryDB(qbsquery, []);
    res.json({done: true, success: true, qbs: qbs });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/get/player/name/', async (req, res) => {
  try {
    var playerData = req.body;
    var name_string = '%' + playerData.name +  '%';
    if(playerData.season && playerData.week) {
      var playerq = ` SELECT p.*, g.game_date
                      FROM nfl.pff_players p 
                        JOIN nfl.pff_qb_stats q ON q.player_id = p.pff_id and p.season = q.season and p.week = q.week  
                        JOIN nfl.pff_games g ON (q.team_id = g.away_team_id OR q.team_id = g.home_team_id) and p.season = g.season and p.week = g.week                        
                      WHERE p.full_name LIKE ? AND q.season = ? and q.week = ?`;
      var player = await queryDB(playerq, [name_string, playerData.season, playerData.week]);
    } else {
      var playerq = ` SELECT p.* 
                      FROM nfl.pff_players p 
                      WHERE p.full_name LIKE ?`;
      var player = await queryDB(playerq, [name_string]);                      
    }
    
    
    res.json({done: true, success: true, player: player[0] });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/get/jakes/:season/:week', async (req, res) => {
  try {
    let weekQuery = '';
    let week = parseInt(req.params.week);
    let season = parseInt(req.params.season);
    let orderByAdd = 'p.jake_score DESC, p.ultimate_score DESC';
    if(req.params.week) {
      weekQuery = `and p.week = ${week}`;
    } else {
      orderByAdd = 'p.week, p.jake_score DESC, p.ultimate_score DESC';
    }

    //console.log('reqp', req.params);

    var jakesQ = `SELECT  p.player, p.att, p.comp, p.fumbles, p.ints, p.rush_carries, p.rush_tds,
                          p.rush_yds, p.tds, p.yds, 
                          ROUND(p.jake_score * 100, 2) as jake_score, 
                          ROUND((p.comp / p.att) * 100, 2) as comp_per,  
                          (p.tds + p.rush_tds) as total_tds,                        
                          g.score_away, g.score_home, t.abbreviation, CONCAT(t.city, ' ', t.nickname) as teamName, t.primary_color, t.secondary_color, p.season, p.week,
                          IF(g.score_away > g.score_home, CONCAT('Final: ', g.score_away, '-', g.score_home), CONCAT('Final: ', g.score_home, '-', g.score_away)) as finalScore, p.ultimate_score,
                          pl.birthday
                  FROM nfl.pff_qb_stats p
                    JOIN nfl.pff_games g ON p.team_id = g.loser_id and p.season = g.season and p.week = g.week
                    JOIN nfl.pff_teams t ON p.team = t.abbreviation and p.season = t.season
                    JOIN nfl.pff_players pl ON pl.pff_id = p.player_id
                  WHERE p.season = ${season} ${weekQuery}
                  ORDER BY ${orderByAdd} `;

    var jakes = await queryDB(jakesQ, []);

    res.json({done: true, success: true, jakes: jakes });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/get/pff/team/:team_abbr/:season', async (req, res) => {
  try {
    var teamq = `SELECT t.* FROM nfl.pff_teams t WHERE t.abbreviation = '${req.params.team_abbr}' and t.season = ${req.params.season}`;
    var team = await queryDB(teamq, []);
    res.json({done: true, success: true, team: team });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/get/pff/teamname/:team_name/:season', async (req, res) => {
  try {
    var teamq = `SELECT t.* FROM nfl.pff_teams t WHERE t.nickname = '${req.params.team_name}' and t.season = ${req.params.season}`;
    var team = await queryDB(teamq, []);
    res.json({done: true, success: true, team: team });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/pff/get/currentweek/:season', async (req, res) => {
  try {
    var week = req.params.week;
    var wquery = ` SELECT MAX(week) as mw FROM nfl.pff_qb_stats WHERE season = ${req.params.season}`;

    var weekinfo = await queryDB(wquery, []);
    res.json({done: true, success: true, week: weekinfo[0].mw });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.get('/update/currentweek/:season/:week', async (req, res) => {
  try {
    var updated = await updateCurrentWeek(req.params.season, req.params.week);
    res.json(updated);
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/update/jakes', async (req, res) => {
  try {
    var scoreData = req.body;
    var scoreQuery = `UPDATE nfl.pff_games SET score_away = ${scoreData.score_away}, score_home = ${scoreData.score_home}
                       WHERE away_team_id = ${scoreData.away_team_id} AND home_team_id = ${scoreData.home_team_id} AND season = ${scoreData.season} AND week = ${scoreData.week}`;
    var scoreOK = await queryDB(scoreQuery, []);

    res.json({done: true, success: scoreOK });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/update/pff/week/', async (req, res) => {
  try {
    var playerData = req.body;
    var updateData = getKeysAndValuesForUpdate(playerData);
    var play_upd = `  UPDATE nfl.pff_qb_stats SET ${updateData.sql} 
                      WHERE id = ${playerData.id} AND season = ${playerData.season} AND week = ${playerData.week}`;
    var playerOK = await queryDB(play_upd, updateData.params);

    res.json({done: true, success: playerOK });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/update/pff/game/date', async (req, res) => {
  try {
    var scoreData = req.body;
    var scoreQuery = `UPDATE nfl.pff_games SET game_date = '${scoreData.game_date}'
                       WHERE away_team_id = ${scoreData.away_team_id} AND home_team_id = ${scoreData.home_team_id} AND season = ${scoreData.season} AND week = ${scoreData.week}`;
    var scoreOK = await queryDB(scoreQuery, []);
    res.json({done: true, success: scoreOK });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/update/pff/game/score', async (req, res) => {
  try {
    var scoreData = req.body;
    var scoreQuery = `UPDATE nfl.pff_games SET score_away = ${scoreData.score_away}, score_home = ${scoreData.score_home}, stadium_id = ${scoreData.stadium_id}, pff_id =${scoreData.pff_id}
                       WHERE away_team_id = ${scoreData.away_team_id} AND home_team_id = ${scoreData.home_team_id} AND season = ${scoreData.season} AND week = ${scoreData.week}`;
    var scoreOK = await queryDB(scoreQuery, []);
    res.json({done: true, success: scoreOK });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/update/pff/player/', async (req, res) => {
  try {
    var playerData = req.body;
    var play_upd = `  UPDATE nfl.pff_qb_stats SET nfl_player_id = ${playerData.player_id} 
                      WHERE id = ${playerData.id}`;
    var playerOK = await queryDB(play_upd, []);

    res.json({done: true, success: playerOK });
  } catch (err) {
    res.status(500).json(error);
  }
});

router.post('/update/pff/ultimate/', async (req, res) => {
  try {
    var playerData = req.body;
    var play_upd = `  UPDATE nfl.pff_qb_stats SET ultimate_score = ${playerData.ultimate} 
                      WHERE id = ${playerData.id}`;
    var playerOK = await queryDB(play_upd, []);

    res.json({done: true, success: playerOK });
  } catch (err) {
    res.status(500).json(error);
  }
});

module.exports = router; 