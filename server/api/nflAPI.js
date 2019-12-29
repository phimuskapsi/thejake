//import axios from 'axios';
const moment  = require('moment');
const fetch = require("node-fetch");
class NFLAPI {
  constructor() {
    this.currentYear = parseInt(moment().format("YYYY"));
    this.feedBaseURL = 'https://feeds.nfl.com/feeds-rs/';
    this.schedules = {};
    this.preSeasons = {};
    this.regSeasons = {};
    this.postSeasons = {};
    this.players = [];
    this.teams = [];
    this.games = [];
  }

  init() {
    // eslint-disable-next-line
    console.log('Filling DB for 2005 ----> 2019 seasons. Hold on to your butts!');
    this.fillDB().then((result) => {
      //eslint-disable-next-line
      console.log('Result: ', result);
    });
  }

  async fillDB() {
    // Lets start by getting all the team data
    var teamResp = await fetch(this.feedBaseURL + 'teams/' + this.currentYear.toString() + '.json');
    var teamJSON = await teamResp.json();

    //console.log('team json:', teamJSON);
    //return;
    //var teamsDone = await this.teamSetup(teamJSON.teams);
    let teamsDone = true;

    if (teamsDone) {
      // eslint-disable-next-line
      //console.log('Team building complete!');
      for (let y = 2011; y <= 2017; y++) {
        //        
        let rosterRes = true;       
        //rosterRes = await this.rosterSetup(y, teamJSON.teams);
        
        //let rosterRes = true;
        if (!rosterRes) {
          // eslint-disable-next-line
          console.log('Failed to retrieve roster(s).');
          return;
        }

        // eslint-disable-next-line
        console.log('Rosters complete for ' + y.toString());

        // Then we'll get all the game data
        let res = await this.getSchedule(y);
        if (!res) {
          // eslint-disable-next-line
          console.log('Failed to retrieve schedule data for year: ' + y.toString());
          return;
        }
        
        // eslint-disable-next-line
        console.log('Retrieved schedule for ' + y.toString());
      }      

      // Should have all the schedules for all years now stored.
      for (var year in this.schedules) {
        if (typeof this.preSeasons[year] === 'undefined') this.preSeasons[year] = [];
        if (typeof this.regSeasons[year] === 'undefined') this.regSeasons[year] = [];
        if (typeof this.postSeasons[year] === 'undefined') this.postSeasons[year] = [];
        let yearData = this.schedules[year];

        /*
        for (var preweek in yearData.pre) {
          if (typeof this.preSeasons[year][preweek] === 'undefined') this.preSeasons[year][preweek] = [];

          let weekGames = yearData.pre[preweek];
          for (let g = 0; g < weekGames.length; g++) {
            let gameid = weekGames[g];
            let gameResp = await fetch(this.feedBaseURL + 'boxscore/' + gameid.toString() + '.json');
            let gameData = await gameResp.json();
            let gameAdded = await this.gameSetup(gameData, 'pre');

            if (gameAdded) {
              // eslint-disable-next-line
              console.log('Added game: ' + gameData.gameSchedule.homeTeamAbbr +
                ' vs. ' + gameData.gameSchedule.visitorTeamAbbr + '. Week ' +
                gameData.gameSchedule.week + ' in ' + gameData.gameSchedule.season);
            }
          }
        }
        */

        
        for (var regweek in yearData.reg) {
          if (typeof this.regSeasons[year][regweek] === 'undefined') this.regSeasons[year][regweek] = [];

          let weekGames = yearData.reg[regweek];
          for (let g = 0; g < weekGames.length; g++) {
            let gameid = weekGames[g];
            let gameResp = await fetch(this.feedBaseURL + 'boxscore/' + gameid.toString() + '.json');
            let gameData = await gameResp.json();
            let gameAdded = await this.gameSetup(gameData, 'reg');

            if (gameAdded) {
              // eslint-disable-next-line
              /*
              console.log('Added game: ' + gameData.gameSchedule.homeTeamAbbr +
                ' vs. ' + gameData.gameSchedule.visitorTeamAbbr + '. Week ' +
                gameData.gameSchedule.week + ' in ' + gameData.gameSchedule.season); */
            }
          }
        }

        // eslint-disable-next-line
        console.log('Regular Season: ' + year.toString() + ' is complete.');

        for (var postweek in yearData.post) {
          if (typeof this.postSeasons[year][postweek] === 'undefined') this.postSeasons[year][postweek] = [];

          let weekGames = yearData.post[postweek];
          for (let g = 0; g < weekGames.length; g++) {
            let gameid = weekGames[g];
            let gameResp = await fetch(this.feedBaseURL + 'boxscore/' + gameid.toString() + '.json');
            let gameData = await gameResp.json();
            let gameAdded = await this.gameSetup(gameData, 'post');

            if (gameAdded) {
              // eslint-disable-next-line
              /*
              console.log('Added game: ' + gameData.gameSchedule.homeTeamAbbr +
                ' vs. ' + gameData.gameSchedule.visitorTeamAbbr + '. Week ' +
                gameData.gameSchedule.week + ' in ' + gameData.gameSchedule.season);*/
            }
          }
        }
        
        // eslint-disable-next-line
        console.log('Post Season: ' + year.toString() + ' is complete.');
      }

      return 'Added all data OK, probably.';
    } else {
      return 'Teams failed.'
    }
  }

  async gameSetup(gameData, seasonType) {
    if (typeof gameData !== 'undefined') {
      let gameInitData = {
        season: gameData.gameSchedule.season,
        seasonType: seasonType,
        week: gameData.gameSchedule.week,
        gameId: gameData.gameSchedule.gameId,
        gameKey: gameData.gameSchedule.gameKey,
        gameDate: gameData.gameSchedule.gameDate,
        gameTimeEastern: gameData.gameSchedule.gameTimeEastern,
        gameTimeLocal: gameData.gameSchedule.gameTimeLocal,
        isoTime: gameData.gameSchedule.isoTime,
        homeTeamId: gameData.gameSchedule.homeTeamId,
        visitorTeamId: gameData.gameSchedule.visitorTeamId,
      };

      let gameReq = await fetch('http://lvh.me:3000/api/v1/add/game/main', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameInitData)
      });

      let gameResp = await gameReq.json();
      if (gameResp.success) {

        //let aggregatesDone = await this.gameAggregateSetup(gameData, seasonType);
        let defensiveDone = await this.gameDefensiveSetup(gameData, seasonType);
        //let fumblesDone = await this.gameFumblesSetup(gameData, seasonType);
        let kickingDone = await this.gameKickingSetup(gameData, seasonType);
        //let passingDone = await this.gamePassingSetup(gameData, seasonType);
        let puntingDone = await this.gamePuntingSetup(gameData, seasonType);
        let receivingDone = await this.gameReceivingSetup(gameData, seasonType);
        let returnDone = await this.gameReturnSetup(gameData, seasonType);
        let rushingDone = await this.gameRushingSetup(gameData, seasonType);
        let done = (defensiveDone && kickingDone && puntingDone && receivingDone && returnDone && rushingDone);

        return done;
      }
    }

    return false;
  }

  async gameAggregateSetup(gameData, seasonType) {
    let aggregateInit = {
      season: gameData.gameSchedule.season,
      seasonType: seasonType,
      week: gameData.gameSchedule.week,
      gameId: gameData.gameSchedule.gameId,
      teamId: ''
    };

    // Insert Home Team Aggregate Info
    let aggregateHomeData = {
      ...aggregateInit,
      ...gameData.homeTeamStats
    };
    aggregateHomeData.teamId = gameData.gameSchedule.homeTeamId;

    let aggReqHome = await fetch('http://lvh.me:3000/api/v1/add/game/aggregate', {
      method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      body: JSON.stringify(aggregateHomeData)
    });

    let aggRespHome = await aggReqHome.json();

    // Insert Visitor Team Aggregate Info
    let aggregateVisitorData = {
      ...aggregateInit,
      ...gameData.visitorTeamStats
    };
    aggregateVisitorData.teamId = gameData.gameSchedule.visitorTeamId;

    let aggReqVisitor = await fetch('http://lvh.me:3000/api/v1/add/game/aggregate', {
      method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      body: JSON.stringify(aggregateVisitorData)
    });

    let aggRespVisitor = await aggReqVisitor.json();

    return aggRespHome.success && aggRespVisitor.success;
  }

  async gameDefensiveSetup(gameData, seasonType) {
    // Insert Defensive Stats
    let defensiveInit = {
      season: gameData.gameSchedule.season,
      seasonType: seasonType,
      week: gameData.gameSchedule.week,
      gameId: gameData.gameSchedule.gameId,
      teamId: 0,
      isHome: false,
      isVisitor: false,
      playerId: 0
    };

    // Home Defense First
    let homeDefense = gameData.homeTeamBoxScoreStat.playerBoxScoreDefensiveStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let hd = 0; hd < homeDefense.length; hd++) {
      let hdPlayer = homeDefense[hd].teamPlayer;
      let hdPlayerStats = homeDefense[hd].playerGameStat.playerDefensiveStat;
      let homeDefensiveData = {
        ...defensiveInit,
        ...hdPlayerStats
      };

      homeDefensiveData.isHome = true;
      homeDefensiveData.teamId = gameData.gameSchedule.homeTeamId;
      homeDefensiveData.playerId = hdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/defensive', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(homeDefensiveData)
      });

      //let homeDefResp = await homeDefReq.json();
    }

    // Visitor Defense First
    let visitorDefense = gameData.visitorTeamBoxScoreStat.playerBoxScoreDefensiveStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let vd = 0; vd < visitorDefense.length; vd++) {
      let vdPlayer = visitorDefense[vd].teamPlayer;
      let vdPlayerStats = visitorDefense[vd].playerGameStat.playerDefensiveStat;
      let visitorDefensiveData = {
        ...defensiveInit,
        ...vdPlayerStats
      };

      visitorDefensiveData.isVisitor = true;
      visitorDefensiveData.teamId = gameData.gameSchedule.visitorTeamId;
      visitorDefensiveData.playerId = vdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/defensive', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitorDefensiveData)
      });

      //let visitorDefResp = await visitorDefReq.json();
    }
  }

  async gameFumblesSetup(gameData, seasonType) {
    // Insert Defensive Stats
    let fumblesInit = {
      season: gameData.gameSchedule.season,
      seasonType: seasonType,
      week: gameData.gameSchedule.week,
      gameId: gameData.gameSchedule.gameId,
      teamId: 0,
      isHome: false,
      isVisitor: false,
      playerId: 0
    };

    // Home Fumbles First
    let homeFumbles = gameData.homeTeamBoxScoreStat.playerBoxScoreFumbleStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let hd = 0; hd < homeFumbles.length; hd++) {
      let hdPlayer = homeFumbles[hd].teamPlayer;
      let hdPlayerStats = homeFumbles[hd].playerGameStat.playerFumbleStat;
      let homeFumblesData = {
        ...fumblesInit,
        ...hdPlayerStats
      };

      homeFumblesData.isHome = true;
      homeFumblesData.teamId = gameData.gameSchedule.homeTeamId;
      homeFumblesData.playerId = hdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/fumbles', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(homeFumblesData)
      });

      //let homeFumResp = await homeFumReq.json();
    }

    // Visitor Defense First
    let visitorFumbles = gameData.visitorTeamBoxScoreStat.playerBoxScoreFumbleStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let vd = 0; vd < visitorFumbles.length; vd++) {
      let vdPlayer = visitorFumbles[vd].teamPlayer;
      let vdPlayerStats = visitorFumbles[vd].playerGameStat.playerFumbleStat;
      let visitorFumblesData = {
        ...fumblesInit,
        ...vdPlayerStats
      };

      visitorFumblesData.isVisitor = true;
      visitorFumblesData.teamId = gameData.gameSchedule.visitorTeamId;
      visitorFumblesData.playerId = vdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/fumbles', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitorFumblesData)
      });

      //let visitorFumResp = await visitorFumReq.json();
    }

    return true;
  }

  async gameKickingSetup(gameData, seasonType) {
    // Insert Defensive Stats
    let kickingInit = {
      season: gameData.gameSchedule.season,
      seasonType: seasonType,
      week: gameData.gameSchedule.week,
      gameId: gameData.gameSchedule.gameId,
      teamId: 0,
      isHome: false,
      isVisitor: false,
      playerId: 0
    };

    // Home Defense First
    let homeKicking = gameData.homeTeamBoxScoreStat.playerBoxScoreKickingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let hd = 0; hd < homeKicking.length; hd++) {
      let hdPlayer = homeKicking[hd].teamPlayer;
      let hdPlayerStats = homeKicking[hd].playerGameStat.playerKickingStat;
      let homeKickingData = {
        ...kickingInit,
        ...hdPlayerStats
      };

      homeKickingData.isHome = true;
      homeKickingData.teamId = gameData.gameSchedule.homeTeamId;
      homeKickingData.playerId = hdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/kicking', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(homeKickingData)
      });

      //let homeDefResp = await homeDefReq.json();
    }

    // Visitor Defense First
    let visitorKicking = gameData.visitorTeamBoxScoreStat.playerBoxScoreKickingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let vd = 0; vd < visitorKicking.length; vd++) {
      let vdPlayer = visitorKicking[vd].teamPlayer;
      let vdPlayerStats = visitorKicking[vd].playerGameStat.playerKickingStat;
      let visitorKickingData = {
        ...kickingInit,
        ...vdPlayerStats
      };

      visitorKickingData.isVisitor = true;
      visitorKickingData.teamId = gameData.gameSchedule.visitorTeamId;
      visitorKickingData.playerId = vdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/kicking', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitorKickingData)
      });

      //let visitorDefResp = await visitorDefReq.json();
    }
  }

  async gamePassingSetup(gameData, seasonType) {
    // Insert Defensive Stats
    let passingInit = {
      season: gameData.gameSchedule.season,
      seasonType: seasonType,
      week: gameData.gameSchedule.week,
      gameId: gameData.gameSchedule.gameId,
      teamId: 0,
      isHome: false,
      isVisitor: false,
      playerId: 0
    };

    // Home Defense First
    let homePassing = gameData.homeTeamBoxScoreStat.playerBoxScorePassingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let hd = 0; hd < homePassing.length; hd++) {
      let hdPlayer = homePassing[hd].teamPlayer;
      let hdPlayerStats = homePassing[hd].playerGameStat.playerPassingStat;
      let homePassingData = {
        ...passingInit,
        ...hdPlayerStats
      };

      homePassingData.isHome = true;
      homePassingData.teamId = gameData.gameSchedule.homeTeamId;
      homePassingData.playerId = hdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/passing', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(homePassingData)
      });

      //let homeDefResp = await homeDefReq.json();
    }

    // Visitor Defense First
    let visitorPassing = gameData.visitorTeamBoxScoreStat.playerBoxScorePassingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let vd = 0; vd < visitorPassing.length; vd++) {
      let vdPlayer = visitorPassing[vd].teamPlayer;
      let vdPlayerStats = visitorPassing[vd].playerGameStat.playerPassingStat;
      let visitorPassingData = {
        ...passingInit,
        ...vdPlayerStats
      };

      visitorPassingData.isVisitor = true;
      visitorPassingData.teamId = gameData.gameSchedule.visitorTeamId;
      visitorPassingData.playerId = vdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/passing', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitorPassingData)
      });

      //let visitorDefResp = await visitorDefReq.json();
    }

    return true;
  }

  async gamePuntingSetup(gameData, seasonType) {
    // Insert Defensive Stats
    let puntingInit = {
      season: gameData.gameSchedule.season,
      seasonType: seasonType,
      week: gameData.gameSchedule.week,
      gameId: gameData.gameSchedule.gameId,
      teamId: 0,
      isHome: false,
      isVisitor: false,
      playerId: 0
    };

    // Home Defense First
    let homePunting = gameData.homeTeamBoxScoreStat.playerBoxScorePuntingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let hd = 0; hd < homePunting.length; hd++) {
      let hdPlayer = homePunting[hd].teamPlayer;
      let hdPlayerStats = homePunting[hd].playerGameStat.playerPuntingStat;
      let homePuntingData = {
        ...puntingInit,
        ...hdPlayerStats
      };

      homePuntingData.isHome = true;
      homePuntingData.teamId = gameData.gameSchedule.homeTeamId;
      homePuntingData.playerId = hdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/punting', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(homePuntingData)
      });

      //let homeDefResp = await homeDefReq.json();
    }

    // Visitor Defense First
    let visitorPunting = gameData.visitorTeamBoxScoreStat.playerBoxScorePuntingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let vd = 0; vd < visitorPunting.length; vd++) {
      let vdPlayer = visitorPunting[vd].teamPlayer;
      let vdPlayerStats = visitorPunting[vd].playerGameStat.playerPuntingStat;
      let visitorPuntingData = {
        ...puntingInit,
        ...vdPlayerStats
      };

      visitorPuntingData.isVisitor = true;
      visitorPuntingData.teamId = gameData.gameSchedule.visitorTeamId;
      visitorPuntingData.playerId = vdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/punting', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitorPuntingData)
      });

      //let visitorDefResp = await visitorDefReq.json();
    }

    return true;
  }

  async gameReceivingSetup(gameData, seasonType) {
    // Insert Defensive Stats
    let receivingInit = {
      season: gameData.gameSchedule.season,
      seasonType: seasonType,
      week: gameData.gameSchedule.week,
      gameId: gameData.gameSchedule.gameId,
      teamId: 0,
      isHome: false,
      isVisitor: false,
      playerId: 0
    };

    // Home Defense First
    let homeReceiving = gameData.homeTeamBoxScoreStat.playerBoxScoreReceivingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let hd = 0; hd < homeReceiving.length; hd++) {
      let hdPlayer = homeReceiving[hd].teamPlayer;
      let hdPlayerStats = homeReceiving[hd].playerGameStat.playerReceivingStat;
      let homeReceivingData = {
        ...receivingInit,
        ...hdPlayerStats
      };

      homeReceivingData.isHome = true;
      homeReceivingData.teamId = gameData.gameSchedule.homeTeamId;
      homeReceivingData.playerId = hdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/receiving', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(homeReceivingData)
      });

      //let homeDefResp = await homeDefReq.json();
    }

    // Visitor Defense First
    let visitorReceiving = gameData.visitorTeamBoxScoreStat.playerBoxScoreReceivingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let vd = 0; vd < visitorReceiving.length; vd++) {
      let vdPlayer = visitorReceiving[vd].teamPlayer;
      let vdPlayerStats = visitorReceiving[vd].playerGameStat.playerReceivingStat;
      let visitorReceivingData = {
        ...receivingInit,
        ...vdPlayerStats
      };

      visitorReceivingData.isVisitor = true;
      visitorReceivingData.teamId = gameData.gameSchedule.visitorTeamId;
      visitorReceivingData.playerId = vdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/receiving', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitorReceivingData)
      });

      //let visitorDefResp = await visitorDefReq.json();
    }
  }

  async gameReturnSetup(gameData, seasonType) {
    // Insert Defensive Stats
    let returnInit = {
      season: gameData.gameSchedule.season,
      seasonType: seasonType,
      week: gameData.gameSchedule.week,
      gameId: gameData.gameSchedule.gameId,
      teamId: 0,
      isHome: false,
      isVisitor: false,
      playerId: 0
    };

    // Home Defense First
    let homeReturn = gameData.homeTeamBoxScoreStat.playerBoxScoreReturnStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let hd = 0; hd < homeReturn.length; hd++) {
      let hdPlayer = homeReturn[hd].teamPlayer;
      let hdPlayerStats = homeReturn[hd].playerGameStat.playerReturnStat;
      let homeReturnData = {
        ...returnInit,
        ...hdPlayerStats
      };

      homeReturnData.isHome = true;
      homeReturnData.teamId = gameData.gameSchedule.homeTeamId;
      homeReturnData.playerId = hdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/return', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(homeReturnData)
      });

      //let homeDefResp = await homeDefReq.json();
    }

    // Visitor Defense First
    let visitorReturn = gameData.visitorTeamBoxScoreStat.playerBoxScoreReturnStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let vd = 0; vd < visitorReturn.length; vd++) {
      let vdPlayer = visitorReturn[vd].teamPlayer;
      let vdPlayerStats = visitorReturn[vd].playerGameStat.playerReturnStat;
      let visitorReturnData = {
        ...returnInit,
        ...vdPlayerStats
      };

      visitorReturnData.isVisitor = true;
      visitorReturnData.teamId = gameData.gameSchedule.visitorTeamId;
      visitorReturnData.playerId = vdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/return', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitorReturnData)
      });

      //let visitorDefResp = await visitorDefReq.json();
    }

    return true;
  }

  async gameRushingSetup(gameData, seasonType) {
    // Insert Defensive Stats
    let rushingInit = {
      season: gameData.gameSchedule.season,
      seasonType: seasonType,
      week: gameData.gameSchedule.week,
      gameId: gameData.gameSchedule.gameId,
      teamId: 0,
      isHome: false,
      isVisitor: false,
      playerId: 0
    };

    // Home Defense First
    let homeRushing = gameData.homeTeamBoxScoreStat.playerBoxScoreRushingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let hd = 0; hd < homeRushing.length; hd++) {
      let hdPlayer = homeRushing[hd].teamPlayer;
      let hdPlayerStats = homeRushing[hd].playerGameStat.playerRushingStat;
      let homeRushingData = {
        ...rushingInit,
        ...hdPlayerStats
      };

      homeRushingData.isHome = true;
      homeRushingData.teamId = gameData.gameSchedule.homeTeamId;
      homeRushingData.playerId = hdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/rushing', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(homeRushingData)
      });

      //let homeDefResp = await homeDefReq.json();
    }

    // Visitor Defense First
    let visitorRushing = gameData.visitorTeamBoxScoreStat.playerBoxScoreRushingStats;

    // Gotta add alllllllllllllllllllllllllllll the players
    for (let vd = 0; vd < visitorRushing.length; vd++) {
      let vdPlayer = visitorRushing[vd].teamPlayer;
      let vdPlayerStats = visitorRushing[vd].playerGameStat.playerRushingStat;
      let visitorRushingData = {
        ...rushingInit,
        ...vdPlayerStats
      };

      visitorRushingData.isVisitor = true;
      visitorRushingData.teamId = gameData.gameSchedule.visitorTeamId;
      visitorRushingData.playerId = vdPlayer.nflId;
      await fetch('http://lvh.me:3000/api/v1/add/game/rushing', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitorRushingData)
      });

      //let visitorDefResp = await visitorDefReq.json();
    }
  }

  async getSchedule(y = 2001) {
    

    if (y > 2000) {
      const response = await fetch(this.feedBaseURL + 'schedules/' + y.toString() + '.json');
      const schedule = await response.json();

      if (typeof(schedule.gameSchedules) !== 'undefined') {
        if (schedule.gameSchedules.length > 0) {
          if (typeof(this.schedules[y]) === 'undefined') this.schedules[y] = [];
          var games = {
            pre: {},
            reg: {},
            post: {}
          };
          // Parse all the weeks in the schedule.
          schedule.gameSchedules.forEach((game) => {
            let st = game.seasonType.toLowerCase();
            if (st !== 'pro') {
            //console.log(st + ": " + game.week.toString());
              if (typeof games[st][game.week] === 'undefined') games[st][game.week] = [];
              // Skip the HoF game, b/c who the hell cares.
              if (game.seasonType === 'PRE' && parseInt(game.week) === 0) return;

              games[st][game.week].push(game.gameId);
            }
          });

          this.schedules[y] = games;
        }
      }
      //console.log('schedule:', schedule);
      //console.log('schedules:', this.schedules);
    }
    
    return Object.keys(this.schedules).length > 0;
  }

  async rosterSetup(rosterYear, teamData) {
    let success = 0;
    let playerCount = 0;

    for (var t = 0; t < teamData.length; t++) {
      let team = teamData[t];
      let req = await fetch(this.feedBaseURL + 'roster/' + team.teamId + '/' + rosterYear.toString() + '.json');
      let resp = await req.json();

      let roster = resp.teamPlayers;
      for (let r = 0; r < roster.length; r++) {
        let player = roster[r];
        let playerData = {};
        let badKeys = ['teamAbbr', 'teamSeq', 'teamFullName'];
        playerCount++;

        for (let playerKey in player) {
          if (badKeys.indexOf(playerKey) >= 0) {
            continue;
          }

          playerData[playerKey] = player[playerKey];
        }

        let insertReq = await fetch('http://lvh.me:3000/api/v1/add/player', {
          method: 'post',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(playerData)
        });

        let ret = await insertReq.json();
        if (ret.success) {
          success++;
          //eslint-disable-next-line
          //console.log('Added player: ' + player.displayName + ' - ' + player.position + ' to player DB.');
        }
      }

      // eslint-disable-next-line
      console.log(team.abbr + ' roster for ' + rosterYear.toString() + ' season, is complete.');
    }

    return success === playerCount;
  }

  async teamSetup(teamData) {
    // So because teams move, and some teams came into existence and some left us, only to come back again later.
    // Though in our case we don't have to worry about it (???)
    let success = 0;
    for (var t = 0; t < teamData.length; t++) {
      let team = teamData[t];
      let teamModified = {
        season: this.currentYear,
        teamId: team.teamId,
        abbr: team.abbr,
        cityState: team.cityState,
        fullName: team.fullName,
        nick: team.nick,
        conferenceAbbr: team.conferenceAbbr,
        divisionAbbr: team.divisionAbbr,
        yearFound: team.yearFound
      };

      //console.log('teamModified', teamModified);
      //console.log('teamData', teamData);
      //console.log('team', team);

      //return ret;

      let req = await fetch('http://lvh.me:3000/api/v1/add/team', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamModified)
      });

      let ret = await req.json();
      //console.log('ret', ret);
      //return ret;

      

      if (ret.success) {
        success++;
        //eslint-disable-next-line
        console.log('Added team: ' + team.abbr + ' to teams DB.');
      }
    }

    return success === teamData.length;
  }
}

var NFL = new NFLAPI();
NFL.init();