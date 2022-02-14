import * as moment from "moment-timezone";

export default class NFLData {
  constructor() {
    this.now = moment();
    this.start = "";
    this.player = {};
    this.players = [];
    this.winLossCache = [];
    this.jakes = [];
    this.weekGames = [];
    this.week = 0;
    this.season = 0;
    this.seasons = [];
  }

  async init() {
    const self = this;
    await self.getCurrentWeek();
  }

  async calcDefStats() {
    try {
      const teamsResp = await fetch(
        `http://xperimental.io:4200/api/v1/get/jakes/def/`
      );
      const teamsRespJSON = await teamsResp.json();
      const history_teams = teamsRespJSON.history;

      const team_totals = {};
      const team_season_totals = {};
      const team_jakes_totals = {};

      for (let t = 0; t < history_teams.length; t++) {
        const team = history_teams[t];
        const team_color = await JSON.parse(team.winner_color);
        // eslint-disable-next-line
        console.log("starting team: " + team.winner);

        if (!team_totals[team.winner_id])
          team_totals[team.winner_id] = {
            total: 0,
            name: team.winner,
            color: team_color.dark_color_ref + " " + team_color.light_color_ref
          };
        if (!team_jakes_totals[team.player_id])
          team_jakes_totals[team.player_id] = {};
        if (!team_jakes_totals[team.player_id][team.winner_id])
          team_jakes_totals[team.player_id][team.winner_id] = {
            total: 0,
            team: team.loser,
            name: team.player,
            winner: team.winner,
            color: team_color.helmet_color_ref
          };

        if (!team_season_totals[team.season])
          team_season_totals[team.season] = {};
        if (!team_season_totals[team.season][team.winner_id])
          team_season_totals[team.season][team.winner_id] = {
            total: 0,
            name: team.winner,
            color: team_color.helmet_color_ref
          };

        team_totals[team.winner_id].total++;
        team_season_totals[team.season][team.winner_id].total++;
        team_jakes_totals[team.player_id][team.winner_id].total++;
      }

      const tt = [];
      for (const k in team_totals) {
        tt.push(team_totals[k]);
      }

      tt.sort((a, b) => {
        return b.total - a.total;
      });

      //console.log(sortable);

      return {
        team_totals: tt,
        team_season_totals: team_season_totals,
        team_jakes_totals: team_jakes_totals,
        ok: true
      };
    } catch (err) {
      return { ok: false };
    }
  }

  async getCurrentWeek() {
    try {
      const req = await fetch(
        "http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"
      );
      const json = await req.json();

      this.week = json.week.number;
      this.season = json.season.year;

      // Get the calendar to figure out where we are.
      const leagueData = json.leagues[0];
      const calendar = leagueData.calendar;
      const seasonType = parseInt(leagueData.season.type.type); // 1= Pre, 2= Reg, 3= Post, 4= Off

      // If we are in the pre-season skip
      if (seasonType === 1)
        return {
          success: true,
          msg: "we're in the pre-season...stay tuned..."
        };
      // If we are in the off-season skip
      if (seasonType === 4)
        return {
          success: true,
          msg: "we're in the off-season...stay tuned..."
        };

      const currentDate = moment();
      let currentWeek = parseInt(
        calendar[seasonType - 1].entries.find(
          entry =>
            moment(entry.startDate) <= currentDate &&
            moment(entry.endDate) >= currentDate
        ).value
      );

      // If we are in the post-season, ESPN re-numbers their weeks from 1-5 (WC, Div, Conf, ProBowl, SuperBowl)
      if (seasonType === 3) currentWeek += 17;
      this.week = currentWeek;

      for (let s = 2008; s <= this.season; s++) {
        this.seasons.push(s);
      }

      return true;
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getESPNPowerRankings(all = false, season = false, week = false) {
    let rankings = [];
    if (all) {
      // Get all season info
      const rankings_req = await fetch(
        "http://xperimental.io:4200/api/v1/get/power_rankings/all"
      );
      rankings = await rankings_req.json();
    } else if (season && week) {
      const rankings_req = await fetch(
        `http://xperimental.io:4200/api/v1/get/power_rankings/season/${season}/week/${week}`
      );
      rankings = await rankings_req.json();
    } else if (season && !week) {
      const rankings_req = await fetch(
        `http://xperimental.io:4200/api/v1/get/power_rankings/season/${season}`
      );
      rankings = await rankings_req.json();
    }

    if (rankings && rankings.rankings.length > 0) {
      return { success: true, rankings: rankings.rankings };
    }
  }

  async getESPNSchedule(season, week, seasonType, returnContent = false) {
    const espnSchedule = await fetch(
      `https://secure.espn.com/core/nfl/schedule?year=${season}&week=${week}&seasontype=${seasonType +
        1}&xhr=1&render=false`
    );
    const espnScheduleData = await espnSchedule.json();
    return returnContent
      ? espnScheduleData.content
      : espnScheduleData.content.schedule;
  }

  async setupSeasonData(season, getAllSeasons = false, update = false) {
    const startYear = getAllSeasons ? 2008 : season;
    const seasons = [];

    for (let y = startYear; y <= season; y++) {
      const espnContent = await this.getESPNSchedule(y, 1, 1, true);
      const calendar = espnContent.calendar;

      const seasonData = {
        pre_start: moment(calendar[Object.keys(calendar)[0]].startDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        pre_end: moment(calendar[Object.keys(calendar)[0]].endDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        reg_start: moment(calendar[Object.keys(calendar)[1]].startDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        reg_end: moment(calendar[Object.keys(calendar)[1]].endDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        post_start: moment(calendar[Object.keys(calendar)[2]].startDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        post_end: moment(calendar[Object.keys(calendar)[2]].endDate)
          .tz("America/New_York")
          .format("YYYY-MM-DD HH:mm:ss"),
        season: y
      };

      seasons.push(seasonData);
    }

    if (update) {
      const url = `http://xperimental.io:4200/api/v1/add/pff/seasons`;
      const updated_season_resp = await fetch(url, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(seasons)
      });
      await updated_season_resp.json();
    }

    return seasons;
  }

  async getSchedule(
    season,
    week,
    seasonType,
    returnSchedule = true,
    update = true,
    last_updated = null
  ) {
    try {
      const schedule = await this.getESPNSchedule(season, week, seasonType);

      // Just return the schedule object, if this is false then we want actual game info.
      if (returnSchedule) return schedule;
      const game_data = [];
      const game_dates = Object.keys(schedule);
      for (let d = 0; d < game_dates.length; d++) {
        const game_date = schedule[game_dates[d]];
        const games = game_date.games;

        for (let g = 0; g < games.length; g++) {
          const game = games[g];
          const away_team = game.competitions[0].competitors.find(
            competitor => competitor.homeAway === "away"
          );
          const home_team = game.competitions[0].competitors.find(
            competitor => competitor.homeAway === "home"
          );

          if (away_team.abbreviation === "WSH") away_team.abbreviation = "WAS";
          if (home_team.abbreviation === "WSH") home_team.abbreviation = "WAS";
          if (away_team.abbreviation === "LAR") away_team.abbreviation = "LA";
          if (home_team.abbreviation === "LAR") home_team.abbreviation = "LA";
          if (away_team.abbreviation === "CLE") away_team.abbreviation = "CLV";
          if (home_team.abbreviation === "CLE") home_team.abbreviation = "CLV";
          if (away_team.abbreviation === "BAL") away_team.abbreviation = "BLT";
          if (home_team.abbreviation === "BAL") home_team.abbreviation = "BLT";
          if (away_team.abbreviation === "HOU") away_team.abbreviation = "HST";
          if (home_team.abbreviation === "HOU") home_team.abbreviation = "HST";
          if (away_team.abbreviation === "ARI") away_team.abbreviation = "ARZ";
          if (home_team.abbreviation === "ARI") home_team.abbreviation = "ARZ";

          const teamIdAR = await fetch(
            `http://xperimental.io:4200/api/v1/get/pff/team/${
              away_team.abbreviation
            }/${season}`
          );
          const teamIdAJ = await teamIdAR.json();
          const awayteamId = teamIdAJ.team[0].franchise_id;

          const teamIdHR = await fetch(
            `http://xperimental.io:4200/api/v1/get/pff/team/${
              home_team.abbreviation
            }/${season}`
          );

          const teamIdHJ = await teamIdHR.json();
          const hometeamId = teamIdHJ.team[0].franchise_id;
          const isTie =
            away_team.score === home_team.score && game.status.type.completed;

          const new_game = {
            id: game.id,
            game_date: moment(game.date)
              .tz("America/New_York")
              .format("Y-MM-DD"),
            status: game.competitions[0].status,
            name: game.name,
            score_away: away_team.score,
            score_home: home_team.score,
            away_team_id: awayteamId,
            home_team_id: hometeamId,
            season: season,
            week: week,
            espn_game_id: game.id,
            active: game.status.type.completed,
            winner: home_team.winner ? "home" : isTie ? "tie" : "away",
            loser_id: home_team.winner ? awayteamId : isTie ? 0 : hometeamId,
            winner_id: home_team.winner ? hometeamId : isTie ? 0 : awayteamId,
            last_updated: last_updated
          };

          if (update) {
            const url = `http://xperimental.io:4200/api/v1/add/pff/game`;
            const updated_game_resp = await fetch(url, {
              method: "post",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify(new_game)
            });

            const updatedGame = await updated_game_resp.json();
            new_game.updated = updatedGame.success;
          } else {
            new_game.updated = false;
          }

          new_game.home_team_abbr = home_team.abbreviation;
          new_game.away_team_abbr = away_team.abbreviation;
          game_data.push(new_game);
        }
      }

      return game_data;
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getJakesByWeek(season = 0, week = 0) {
    let players = [];

    const getSeason = season > 0 ? season : this.season;
    const getWeek = week > 0 ? week : this.week;
    try {
      const jakeReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/jakes/${getSeason}/${getWeek}`
      );
      players = await jakeReq.json();

      if (players.jakes.length > 0) {
        return { success: true, players: players.jakes };
      }

      throw { success: false, msg: "no players found" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getJakesBySeason(season = 0) {
    let players = [];
    const getSeason = season > 0 ? season : this.season;
    try {
      const jakeReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/jakes/${getSeason}`
      );
      players = await jakeReq.json();

      if (players.length > 0) {
        return { success: true, players: players.jakes };
      }

      throw { success: false, msg: "no players found" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getJakesHistory() {
    let players = [];

    try {
      const jakeReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/jakes_history/`
      );
      players = await jakeReq.json();

      if (players.jakes.length > 0) {
        return { success: true, players: players.jakes };
      }

      throw { success: false, msg: "no players found" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getJakesUltimate(season) {
    let players = [];
    const getSeason = season > 0 ? season : this.season;
    try {
      const jakeReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/ultimate/${getSeason}`
      );
      players = await jakeReq.json();

      if (players && players.jakes && players.jakes.length > 0) {
        for (let p = 0; p < players.jakes.length; p++) {
          const jake = players.jakes[p];
          const positions = jake.positions.split(",");
          const ordered = {
            first: 0,
            second: 0,
            third: 0,
            fourth: 0
          };

          for (const pos in positions) {
            const position = positions[pos];
            if (parseInt(position) === 1) {
              ordered.first++;
            }
            if (parseInt(position) === 2) {
              ordered.second++;
            }
            if (parseInt(position) === 3) {
              ordered.third++;
            }
            if (parseInt(position) === 4) {
              ordered.fourth++;
            }
          }

          players.jakes[p].qbr_avg = players.jakes[p].qbr_avg.toFixed(2);
          players.jakes[p].jake_total = players.jakes[p].jake_total.toFixed(2);
          players.jakes[p].positions = ordered;
        }

        return { success: true, players: players.jakes };
      }

      throw { success: false, msg: "no players found" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getPlayersByWeek(season = 0, week = 0) {
    let players = [];

    const getSeason = season > 0 ? season : this.season;
    const getWeek = week > 0 ? week : this.week;
    try {
      const playerReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/player_stats/${getSeason}/${getWeek}`
      );
      players = await playerReq.json();
      if (players.players.length > 0) {
        return { success: true, players: players.players };
      }

      throw { success: false, msg: "no players found" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getPlayersBySeason(season = 0) {
    let players = [];
    const getSeason = season > 0 ? season : this.season;
    try {
      const playerReq = await fetch(
        `http://xperimental.io:4200/api/v1/get/player_stats/${getSeason}`
      );
      players = await playerReq.json();

      if (players.players.length > 0) {
        return { success: true, players: players.players };
      }

      throw { success: false, msg: "no players to fetch" };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async getTeamInfo(season = 2021) {
    try {
      const team_req = await fetch(
        `http://xperimental.io:4200/get/pff/teams/${season}`
      );
      const team_json = team_req.json();

      return { success: true, teams: team_json };
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }

  async updateCurrentWeek(season = 0, week = 0) {
    try {
      let selected_season = this.season;
      let selected_week = this.week;

      if (season > 0) selected_season = season;
      if (week > 0) selected_week = week;

      const latestWeekResp = await fetch(
        `http://xperimental.io:4200/api/v1/update/currentweek/${selected_season}/${selected_week}`
      );
      const latestWeek = await latestWeekResp.json();
      return latestWeek;
    } catch (err) {
      //eslint-disable-next-line
      console.log("error:", err);
      return err;
    }
  }
}
