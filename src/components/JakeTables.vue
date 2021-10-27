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
          <v-tabs v-model="tab" background-color="grey darken-3" dark>
            <v-tab key="weekly">Weekly Winners</v-tab>
            <v-tab v-for="score in scoreTabs" :key="score">
              Score: {{ score }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item key="weekly">
              <v-data-table
                :headers="headers"
                :items="jakeWinners"
                :items-per-page="50"
                class="elevation-2"
              ></v-data-table>
            </v-tab-item>
            <v-tab-item v-for="score in scoreTabs" :key="score">
              <v-data-table
                :headers="headers"
                :items="jakesByScore[score]"
                :items-per-page="50"
                class="elevation-2"
              ></v-data-table>
            </v-tab-item>
          </v-tabs-items>
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
          value: "name"
        },
        {
          text: "Team:",
          value: "team"
        },
        {
          text: "Season:",
          value: "season"
        },
        {
          text: "Week:",
          value: "week"
        },
        {
          text: "Ints:",
          value: "ints"
        },
        {
          text: "Fum:",
          value: "fumbles"
        },
        {
          text: "Score:",
          value: "score"
        },
        {
          text: "TruJake:",
          value: "ultimate"
        },
        {
          text: "Position:",
          value: "position"
        }
      ],
      tab: null,
      scoreTabs: [],
      jakesByScore: {},
      jakeWinners: [],
      showLoading: false
    };
  },
  methods: {
    async getTableData() {
      try {
        const tableRes = await fetch(
          `http://xperimental.io:4200/api/v1/get/jake/tables`
        );
        let tableData = await tableRes.json();

        if (tableData.success) {
          this.jakesByScore = tableData.score;
          this.jakeWinners = tableData.winners;
          this.scoreTabs = Object.keys(tableData.score).sort((a, b) => {
            if (parseFloat(a) > parseFloat(b)) {
              return -1;
            }

            if (parseFloat(a) < parseFloat(b)) {
              return 1;
            }

            return 0;
          });
        } else {
          throw "Failed to fetch data from API.";
        }
      } catch (err) {
        console.log("Error:", err);
      }
    }
  },
  mounted() {
    this.showLoading = true;
    this.getTableData().then(() => {
      this.showLoading = false;
    });
  }
};
</script>
