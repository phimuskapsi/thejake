<template>
  <div>
    <v-container fluid>
      <v-row no-gutters>
        <v-col md="3" lg="2" xl="2" class="d-none d-md-block">
          <side-nav></side-nav>
        </v-col>
        <v-col cols="12" class="d-md-none"> </v-col>
        <v-col
          xl="10"
          lg="10"
          md="9"
          sm="12"
          style="padding: 0em 2em !important;"
        >
          <v-banner single-line>
            Historical Jakes
          </v-banner>
          <v-row>
            <v-col cols="12" v-if="showHistory">
              <zingchart :data="historyChart"></zingchart>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" v-if="showTeamDef">
              <zingchart :data="teamDefChart"></zingchart>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" v-if="showTeamDefSeason">
              <zingchart :data="teamDefSeasonChart"></zingchart>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" v-if="showTeamPlayerChart">
              <zingchart :data="teamPlayerChart"></zingchart>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import NFLData from "../plugins/pffFunctions.js";
import SideNav from "./SideNav";

export default {
  components: { SideNav },
  data() {
    return {
      NFLData: new NFLData(),
      stats_headers: [
        {
          text: "Player",
          value: "player"
        },
        { text: "Team", value: "abbreviation" },
        { text: "Int", value: "ints" },
        { text: "Fumbles", value: "fumbles" },
        { text: "Jake Score", value: "jake_score" },
        { text: "TruJake", value: "ultimate_score" },
        { text: "Score", value: "finalScore" }
      ],
      seasons: [],
      weeks: [],
      seasonData: [],
      selectedHistory: [],
      selectedHistoryStats: [],
      selectedSeasonType: "REG",
      selectedSeason: 0,
      selectedWeek: 1,
      firstRun: true,
      history: [],
      historyChart: {},
      historicalStats: {},
      teamDefChart: {},
      teamDefSeasonChart: {},
      teamPlayerChart: {},
      showHistory: false,
      showHistoryTable: false,
      showTeamDef: false,
      showTeamDefSeason: false,
      showTeamPlayerChart: false,
      teamHistories: {}
    };
  },
  created() {
    this.setupData().then(dataOK => {
      if (dataOK) {
        this.getHistory().then(() => {
          this.drawHistoryGraphs().then(() => {
            this.finishAndShow();
          });
        });
      }
    });
  },
  methods: {
    async drawHistoryGraphs() {},
    async finishAndShow() {
      this.firstRun = false;
    },
    async getHistory() {
      //var self = this;
      //var historicalStats = await this.NFLData.getJakesByWeek(0, 0);
      var history = await this.NFLData.getJakesHistory();
      var teamHistories = await this.NFLData.calcDefStats();

      this.history = history.players;
      this.teamHistories = teamHistories;
      /*
        for (let h=0;h<historicalStats.length;h++) {
          let history_stats = historicalStats[h];

          if (this.historicalStats[this.selectedSeason][this.selectedWeek].players.length > 0) {
            this.selectedHistoryStats = this.historicalStats[this.selectedSeason][this.selectedWeek].players;
            //this.showHistoryTable = true;
          } else {
            this.historicalStats[this.selectedSeason][this.selectedWeek].players = history_stats;
            this.selectedHistory = history_stats;
            //this.showHistoryTable = true;
          }
        }*/
      this.teamDefChart = {
        type: "bar",
        title: {
          text: "Team Production of Jakes (DEF)"
        },
        plot: {
          "value-box": {
            text: "%v"
          },
          "bars-space-left": 0.15,
          "bars-space-right": 0.15,
          animation: {
            effect: "ANIMATION_SLIDE_BOTTOM",
            sequence: 0,
            speed: 800,
            delay: 800
          },
          styles: []
        },
        legend: {},
        "scale-x": {
          "items-overlap": true,
          "max-items": 32,
          labels: [],
          item: {
            "font-size": 10
          }
        },
        series: [
          {
            type: "bar",
            values: [],
            text: "",
            borderRadiusTopLeft: 7,
            alpha: 0.95
          }
        ]
      };

      this.historyChart = {
        type: "mixed",
        title: {
          text: "Jake Wall Of Shame"
        },
        plot: {
          "value-box": {
            text: "%v"
          },
          "bars-space-left": 0.15,
          "bars-space-right": 0.15,
          animation: {
            effect: "ANIMATION_SLIDE_BOTTOM",
            sequence: 0,
            speed: 800,
            delay: 800
          }
        },
        legend: {},
        "scale-x": {
          labels: [],
          item: {
            "font-size": 12
          }
        },
        series: [
          {
            type: "bar",
            values: [],
            text: "1st Place",
            borderRadiusTopLeft: 7,
            alpha: 0.95,
            "background-color": "gold"
          },
          {
            type: "bar",
            values: [],
            text: "2nd Place",
            borderRadiusTopLeft: 7,
            alpha: 0.95,
            "background-color": "silver"
          },
          {
            type: "bar",
            values: [],
            text: "3rd Place",
            borderRadiusTopLeft: 7,
            alpha: 0.95,
            "background-color": "#cd7f32"
          },
          {
            type: "bar",
            values: [],
            text: "Qualified",
            borderRadiusTopLeft: 7,
            alpha: 0.95,
            "background-color": "#efefef",
            "border-width": 1,
            "border-color": "silver"
          },
          {
            type: "line",
            values: [],
            text: "Total Jakes"
          },
          {
            type: "line",
            values: [],
            text: "Total Games"
          },
          {
            type: "line",
            values: [0],
            text: "Score"
          }
        ]
      };

      for (let hh = 0; hh < this.history.length; hh++) {
        var hist = this.history[hh];
        var scorePercent = (hist.record_jake * 100).toFixed(2);
        this.historyChart.series[0].values.push(hist.jake_position_1);
        this.historyChart.series[1].values.push(hist.jake_position_2);
        this.historyChart.series[2].values.push(hist.jake_position_3);
        this.historyChart.series[3].values.push(hist.jake_position_4);
        this.historyChart.series[4].values.push(hist.totalJakes);
        this.historyChart.series[5].values.push(hist.totalGames);
        this.historyChart.series[6].values.push(scorePercent);

        this.historyChart["scale-x"].labels.push(hist.full_name);
      }

      this.showHistory = true;

      for (var team_id in this.teamHistories.team_totals) {
        var team_total = this.teamHistories.team_totals[team_id];
        this.teamDefChart.series[0].values.push(team_total.total);
        this.teamDefChart["scale-x"].labels.push(team_total.name);
        this.teamDefChart["plot"].styles.push({
          "background-color": team_total.color
        });
      }

      this.showTeamDef = true;
    },
    async getHistoryByWeek() {
      if (this.selectedSeason > 0) {
        if (this.selectedWeek > 0) {
          if (
            this.historicalStats[this.selectedSeason][this.selectedWeek].players
              .length > 0
          ) {
            this.selectedHistory = this.historicalStats[this.selectedSeason][
              this.selectedWeek
            ].players;
            this.showHistoryTable = true;
          } else {
            let weekData = await this.NFLData.getJakesByWeek(
              this.selectedSeason,
              this.selectedWeek
            );
            this.historicalStats[this.selectedSeason][
              this.selectedWeek
            ].players = weekData.players;
            this.selectedHistory = weekData;
            this.showHistoryTable = true;
          }
        }

        return;
      }

      this.showHistoryTable = false;
      return;
    },
    async setupData() {
      await this.NFLData.init();
      this.updateProgress(true);

      localStorage.setItem("history-jake_season", this.NFLData.season);
      localStorage.setItem("history-jake_week", this.NFLData.week);

      this.selectedSeason = this.NFLData.season;
      this.selectedWeek = this.NFLData.week;
      let maxWeek = this.selectedWeek;

      for (let y = this.selectedSeason; y > 2007; y--) {
        this.historicalStats[y] = [];
        this.seasons.push(y);

        if (y < this.selectedSeason) maxWeek = 21;
        for (let w = 1; w <= maxWeek; w++) {
          if (typeof this.weeks[w] === "undefined") this.weeks.push(w);
          this.historicalStats[y][w] = {
            players: []
          };
        }
      }

      this.updateProgress(20);
      return true;
    },
    updateProgress(val) {
      this.$emit("updateProgress", val);
    }
  }
};
</script>

<style>
.v-card__title {
  background-color: rgba(20, 20, 20, 0.5);
}

.king-score {
  position: absolute;
  bottom: 30px;
  right: 63px;
}
</style>
