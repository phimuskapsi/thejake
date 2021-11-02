<template>
  <div>
    <v-container fluid style="height:100%">
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
          v-if="showGraf"
        >
          <div>
            <v-select
              v-model="selectedSeason"
              :items="seasonsSelect"
              label="Season"
              @change="updateUltimate()"
            ></v-select>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          xl="10"
          lg="10"
          md="9"
          sm="12"
          style="padding: 0em 2em !important;"
          v-if="showTable"
        >
          <v-data-table
            :headers="headers"
            :items="jakeWinners"
            :items-per-page="50"
            class="elevation-2"
          ></v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import SideNav from "./SideNav";

export default {
  components: { SideNav },
  data() {
    return {
      headers: [
        {
          text: "Player:",
          align: "start",
          sortable: true,
          value: "player"
        },
        {
          text: "Team:",
          value: "team"
        },
        {
          text: "ATT:",
          value: "attempts"
        },
        {
          text: "COMP:",
          value: "completions"
        },
        {
          text: "TD:",
          value: "tds"
        },
        {
          text: "INT",
          value: "ints"
        },
        {
          text: "FUM",
          value: "fumbles"
        },
        {
          text: "SACKS",
          value: "sacks",
        },
        {
          text: "QBR (avg):",
          value: "qbr_avg"
        },
        {
          text: "TruJake Total:",
          value: "jake_total"
        },
        {
          text: "Positions:",
          value: "positions"
        }
      ],
      seasonsSelect: [],
      selectedSeason: 0,
      showTable: false,
      ultimateJakes: []
    }
  },
  methods: {
    async getData(season) {
      try {
        let player_req = await this.$NFLData.getJakesUltimate(season);
        if (player_req && player_req.players) {
          this.ultimateJakes = player_req.players;

          
          this.showTable = true;
        }
      } catch (err) {
        console.log(err);
      }      
    },
    async updateUltimate() {
      await this.getData(this.selectedSeason);
    }
  },
  mounted() {
    this.getData(this.$NFLData.season).then(() => {
      localStorage.setItem("ultimate_season", this.$NFLData.season);
      this.seasonsSelect = this.$NFLData.seasons;
    })
  }
}