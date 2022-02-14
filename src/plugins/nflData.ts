import axios from "axios";
import * as moment from "moment";

export default class NFLData {
  constructor() {
    this.now = moment();
    this.start = "";
    this.player = {};
    this.players = [];
    this.winLossCache = [];
    this.jakes = [];
    this.weekGames = [];

    // Might as well really init the week number
    // As soon as noon passes of the sunday it rolls to the proper week
    //this.week = Math.ceil(this.now.diff(this.start, 'weeks', true));
    //this.week = this.week > 17 ? 17 : this.week;
    this.week = 1;
    this.season = this.now.format("YYYY");
    this.position = "QB";
    this.apiKey = "naBSrfRl2voKxZ0TNHsdAiy36PzV7ebt";
  }

  async init() {
    const self = this;
    self.week = await self.getCurrentWeek();
  }

  async getJakes(y = 0, w = 0) {
    const self = this;
    let players = [];

    await self.getHistoricalDataFromAPI(y, w);
    players = self.parseWeekData();

    if (players.length > 0) {
      return players;
    }

    return false;
  }

  async getCurrentWeek() {
    const self = this;
    const scheduleURL = "https://profootballapi.com/schedule";
    const scheduleData = {
      api_key: self.apiKey,
      year: self.season,
      season_type: "REG"
    };

    let lastFinal = 0;
    let cWeek = 0;

    try {
      //eslint-disable-next-line
      //console.log('starting season: ', year.toString());
      const schedule = await axios.post(scheduleURL, scheduleData);
      if (schedule.data.length > 0) {
        const sdata = schedule.data;
        for (let g = 0; g < sdata.length; g++) {
          const game = sdata[g];
          if (cWeek !== game.week) {
            cWeek = game.week;
          } else {
            if (lastFinal === cWeek) {
              continue;
            }
          }

          if (game.final === 1) {
            lastFinal = cWeek;
          }
        }
      }

      return lastFinal;
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getJakeHistory(y = -1, w = -1) {
    let url = "http://xperimental.io:4200/api/players/jakes/history";

    if (y > -1) {
      url += `/${y}`;

      if (w > -1) {
        url += `/${w}`;
      }
    }

    const history = await axios.get(url);
    if (history.data.length > 0) {
      return history.data;
    }

    return false;
  }

  async getPlayerWin() {
    const self = this;
    // See if we've already seen the team info for this player.
    if (
      self.winLossCache.length > 0 &&
      self.winLossCache.keys().indexOf(self.player.teamAbbr) >= 0
    ) {
      const cache = self.winLossCache[self.player.teamAbbr];
      self.player.winLossInfo = {
        win: cache.win,
        score: cache.score
      };
    } else {
      // Nope, let's grab that players matchup and set the winLossInfo while also filling the cache with the opposing team
      // theoretically this will knock this down to 16 grabs instead of 30-32 (depending if byes)
      const url = `https://api.fantasy.nfl.com/v1/players/advanced?teamAbbr=${
        self.player.teamAbbr
      }&season=${self.season}&week=${self.week}&format=json&position=${
        self.position
      }`;
      const response = await axios.get(url);
      const gameInfo = response.data;

      if (gameInfo.QB.length > 0) {
        // Then we have something to look at.
        for (let g = 0; g < gameInfo.QB.length; g++) {
          const game = gameInfo.QB[g];
          // lets just check that our players match, they may not
          if (game.gsisPlayerId === self.player.nflId) {
            const status = game.status.split(",");

            self.player.winLossInfo = {
              win: status[0].trim().toLowerCase() === "win",
              score: status[1].trim()
            };

            // check cache for opponent data (which should theoretically always be like this in here)
            if (
              self.winLossCache.length === 0 ||
              self.winLossCache.keys().indexOf(game.opponentTeamAbbr) === -1
            ) {
              self.winLossCache[game.opponentTeamAbbr] = {
                win: !self.player.winLossInfo.win,
                score: self.player.winLossInfo.score
              };
            }
          } // player match end
        } // end loop
      }
    }

    return;
  }

  parseWeekData() {
    const self = this;
    const players = [];

    for (let g = 0; g < self.weekGames.length; g++) {
      const game = self.weekGames[g];
      players.push(game.away.QB);
      players.push(game.home.QB);
    }

    if (players.length > 0) {
      players.sort((a, b) => {
        return b.jake_score - a.jake_score;
      });

      let jakepos = 0;
      let lastjake = 0.0;

      for (let p = 0; p < players.length; p++) {
        const player = players[p];
        const lname = player.name.toLowerCase();

        try {
          player.image = require("../assets/players/" + lname + ".jpg");
        } catch (err) {
          player.image = require("../assets/players/no-image.jpg");
        }

        if (p === 0) {
          lastjake = player.jake_score;
        } else {
          if (player.jake_score < lastjake) {
            lastjake = player.jake_score;
            jakepos++;
          }
        }

        player.jakepos = jakepos;
        switch (player.jakepos) {
          case 0:
            player.place = "first";
            player.color = "gold";
            player.jakeImage = require("../assets/jake_gold.jpg");
            break;
          case 1:
            player.place = "second";
            player.color = "silver";
            player.jakeImage = require("../assets/jake_silver.jpg");
            break;
          case 2:
            player.place = "third";
            player.color = "bronze";
            player.jakeImage = require("../assets/jake_bronze.jpg");
            break;
          case 3:
            player.place = "other";
            player.color = "darkgreen";
            player.jakeImage = require("../assets/jake_award.jpg");
            break;
        }

        player.team = player.team.toUpperCase();
        player.icon = require("../assets/teams/" + player.team + "-icon.png");
        players[p] = player;
      }

      return true;
    }
  }

  async getHistoricalDataFromAPI(year = 2007, week = 0) {
    const self = this;
    const scheduleURL = "http://xperimental.io:4200/api/v1/get/jakes/";
    const scheduleData = {
      api_key: self.apiKey,
      year: year,
      season_type: "REG"
    };

    if (week > 0) {
      scheduleData.week = week;
    }

    try {
      //eslint-disable-next-line
      //console.log('starting season: ', year.toString());
      const schedule = await axios.get(scheduleURL, scheduleData);

      //eslint-disable-next-line
      //console.log(year.toString() + ' schedule received.');
      const weeks = await self.getWeeksFromSchedule(schedule.data);

      //eslint-disable-next-line
      //console.log(year.toString() + ' game week data received and parsed.');
      //eslint-disable-next-line
      //console.log('done fetching data');
      if (week > 0) {
        self.weekGames = weeks[week];
        return;
      }

      return weeks;
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  getPlayerDataFromGames(gameData = {}) {
    //console.log('gameData:', gameData);
    const homePassing = gameData.home.stats.passing;
    let homeQBId = 0;

    const awayPassing = gameData.away.stats.passing;
    let awayQBId = 0;

    if (Object.keys(homePassing).length > 1) {
      // More than one potential QB.
      for (let hp = 0; hp < Object.keys(homePassing).length; hp++) {
        const key = Object.keys(homePassing)[hp];
        const passer = homePassing[key];
        // kind of arbitrary...oh well
        if (passer.attempts > 5) {
          homeQBId = key;
          break;
        }
      }
    } else {
      homeQBId = Object.keys(homePassing)[0];
    }

    if (Object.keys(awayPassing).length > 1) {
      // More than one potential QB.
      for (let ap = 0; ap < Object.keys(awayPassing).length; ap++) {
        const key = Object.keys(awayPassing)[ap];
        const passer = awayPassing[key];
        // kind of arbitrary...oh well
        if (passer.attempts > 5) {
          awayQBId = key;
          break;
        }
      }
    } else {
      awayQBId = Object.keys(awayPassing)[0];
    }

    const homeQB = {
      id: homeQBId,
      team: gameData.home.team,
      passing: {},
      fumbles: {},
      rushing: {}
    };

    const awayQB = {
      id: awayQBId,
      team: gameData.away.team,
      passing: {},
      fumbles: {},
      rushing: {}
    };

    homeQB.passing = gameData.home.stats.passing[homeQB.id];
    awayQB.passing = gameData.away.stats.passing[awayQB.id];

    if (
      gameData.home.stats.fumbles !== undefined &&
      gameData.home.stats.fumbles[homeQB.id] !== undefined
    ) {
      homeQB.fumbles = gameData.home.stats.fumbles[homeQB.id];
    }

    if (
      gameData.away.stats.fumbles !== undefined &&
      gameData.away.stats.fumbles[awayQB.id] !== undefined
    ) {
      awayQB.fumbles = gameData.away.stats.fumbles[awayQB.id];
    }

    if (
      gameData.home.stats.rushing !== undefined &&
      gameData.home.stats.rushing[homeQB.id] !== undefined
    ) {
      homeQB.rushing = gameData.home.stats.rushing[homeQB.id];
    }

    if (
      gameData.away.stats.rushing !== undefined &&
      gameData.away.stats.rushing[awayQB.id] !== undefined
    ) {
      awayQB.rushing = gameData.away.stats.rushing[awayQB.id];
    }

    // let home = new NFLPlayer(homeQB, homeQB.id);
    // let away = new NFLPlayer(awayQB, awayQB.id);
    // console.log('away qb', awayQBId);
    // console.log('home qb', homeQBId);

    return {
      home: new NFLPlayer(homeQB),
      away: new NFLPlayer(awayQB)
    };
  }

  async getWeeksFromSchedule(incomingSchedule = []) {
    const self = this;
    const weeks = {};

    if (incomingSchedule.length > 0) {
      for (let i = 0; i < incomingSchedule.length; i++) {
        const game = incomingSchedule[i];

        //eslint-disable-next-line
        //console.log('week ' + game.week.toString() + ': fetching game data');
        // We don't want to waste time parsing future games.
        if (game.year === self.season && game.week > self.week) continue;

        if (weeks[game.week] === undefined) {
          weeks[game.week] = [];
        }

        const gm = new NFLGame(game);
        const gameDetailURL = "https://profootballapi.com/game";
        const gameDetailData = {
          api_key: self.apiKey,
          game_id: gm.id
        };

        try {
          if (gameDetailData.game_id !== -1) {
            const gameDetail = await axios.post(gameDetailURL, gameDetailData);
            const QBs = this.getPlayerDataFromGames(gameDetail.data);

            // eslint-disable-next-line
            //console.log('qb data', QBs);

            QBs.home.stats.win = gm.home.score > gm.away.score;
            QBs.away.stats.win = gm.away.score > gm.home.score;

            gm.home.QB = QBs.home;
            gm.away.QB = QBs.away;
            weeks[game.week].push(gm);

            //eslint-disable-next-line
            //console.log('week ' + game.week.toString() + ': game data received');
          }
        } catch (err) {
          // weeks[game.week].push({
          //  id: -1,
          //  message: 'server error retrieving game: ' + gm.id
          // });
          continue;
        }
      }

      return weeks;
    }
  }
}

class NFLPlayer {
  constructor(playerRow) {
    if (playerRow.passing.attempts <= 5) return false;

    this.color = "";
    this.place = "";
    this.name = playerRow.passing.name;
    this.icon = "";
    this.image = "";
    this.jakeMulti = 1 / 6;
    this.jakeImage = "";
    this.playerId = playerRow.id;
    this.team = playerRow.team;
    this.stats = {
      attempts:
        typeof playerRow.passing !== undefined &&
        typeof playerRow.passing.attempts !== "undefined"
          ? playerRow.passing.attempts
          : 0,
      completions:
        typeof playerRow.passing !== undefined &&
        typeof playerRow.passing.completions !== "undefined"
          ? playerRow.passing.completions
          : 0,
      passYards:
        typeof playerRow.passing !== undefined &&
        typeof playerRow.passing.yards !== "undefined"
          ? playerRow.passing.yards
          : 0,
      passTds:
        typeof playerRow.passing !== undefined &&
        typeof playerRow.passing.touchdowns !== "undefined"
          ? playerRow.passing.touchdowns
          : 0,
      ints:
        typeof playerRow.passing !== undefined &&
        typeof playerRow.passing.interceptions !== "undefined"
          ? playerRow.passing.interceptions
          : 0,
      rushAttempts: 0,
      rushYards: 0,
      rushTds: 0,
      fumblesLost: 0,
      fumbles: 0,
      win: 0
    };

    if (playerRow.rushing !== undefined) {
      this.stats.rushAttempts =
        typeof playerRow.rushing.attempts !== "undefined"
          ? playerRow.rushing.attempts
          : 0;
      this.stats.rushYards =
        typeof playerRow.rushing.yards !== "undefined"
          ? playerRow.rushing.yards
          : 0;
      this.stats.rushTds =
        typeof playerRow.rushing.touchdowns !== "undefined"
          ? playerRow.rushing.touchdowns
          : 0;
    }

    if (playerRow.fumbles !== undefined) {
      this.stats.fumblesLost =
        typeof playerRow.fumbles.fumbles_lost !== "undefined"
          ? playerRow.fumbles.fumbles_lost
          : 0;
      this.stats.fumbles =
        typeof playerRow.fumbles.total_fumbles !== "undefined"
          ? playerRow.fumbles.total_fumbles
          : 0;
    }

    this.jake_score = parseFloat(
      (parseInt(this.stats.fumblesLost) + parseInt(this.stats.ints)) *
        this.jakeMulti *
        100
    ).toFixed(2);
    if (isNaN(this.jake_score)) this.jake_score = "0.00";
  }
}

class NFLGame {
  constructor(gameData) {
    this.away = {
      win: gameData.away_score > gameData.home_score,
      score: gameData.away_score,
      team: gameData.away,
      QB: {}
    };

    this.home = {
      win: gameData.home_score > gameData.away_score,
      score: gameData.home_score,
      team: gameData.home,
      QB: {}
    };

    this.id = gameData.id;
    this.year = gameData.year;
    this.week = gameData.week;
    this.date =
      gameData.year.toString() +
      "-" +
      gameData.month.toString() +
      "-" +
      gameData.day.toString();
    this.final = gameData.final == 1;
  }
}
