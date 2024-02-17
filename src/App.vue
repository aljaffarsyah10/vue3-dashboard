<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <query-renderer :cubejs-api="cubejsApi2" :query="query">
          <template #default="{ resultSet }">
            <div class="chart-renderer" style="height: 400px" v-if="resultSet">
              <component
                v-if="componentType"
                :is="componentType"
                :data="data(resultSet)"
                :stacked="isStacked"
                height="400px"
              ></component>

              <Table
                v-if="chartType === 'table'"
                :result-set="resultSet"
              ></Table>

              <div
                v-if="chartType === 'number'"
                class="number-container"
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100%;
                  flex-direction: column;
                "
              >
                <div
                  v-for="item in resultSet.series()"
                  :key="item.key"
                  style="font-size: 24px"
                >
                  {{ item.series[0].value }}
                </div>
              </div>
            </div>
          </template>
        </query-renderer>
      </div>
      <div class="col-sm-4">
        <query-builder :cubejs-api="cubejsApi2" :query="ticketQuery">
          <template v-slot="{ loading, resultSet }">
            <Chart
              title="Total Ticket"
              type="number"
              :loading="loading"
              :result-set="resultSet"
            />
          </template>
        </query-builder>
      </div>
      <div class="col-sm-4">
        <query-builder :cubejs-api="cubejsApi" :query="usersQuery">
          <template v-slot="{ loading, resultSet }">
            <Chart
              title="Total Users"
              type="number"
              :loading="loading"
              :result-set="resultSet"
            />
          </template>
        </query-builder>
      </div>
      <div class="col-sm-4">
        <query-builder :cubejs-api="cubejsApi" :query="totalOrdersQuery">
          <template v-slot="{ loading, resultSet }">
            <Chart
              title="Total Orders"
              type="number"
              :loading="loading"
              :result-set="resultSet"
            />
          </template>
        </query-builder>
      </div>
      <div class="col-sm-4">
        <query-builder :cubejs-api="cubejsApi" :query="shippedOrdersQuery">
          <template v-slot="{ loading, resultSet }">
            <Chart
              title="Shipped Users"
              type="number"
              :loading="loading"
              :result-set="resultSet"
            />
          </template>
        </query-builder>
      </div>
    </div>
    <br />
    <br />
    <div class="row">
      <div class="col-sm-6">
        <query-builder :cubejs-api="cubejsApi" :query="lineQuery">
          <template v-slot="{ loading, resultSet }">
            <Chart
              title="New Users Over Time"
              type="line"
              :loading="loading"
              :result-set="resultSet"
            />
          </template>
        </query-builder>
      </div>
      <div class="col-sm-6">
        <query-builder :cubejs-api="cubejsApi" :query="barQuery">
          <template v-slot="{ loading, resultSet }">
            <Chart
              title="Orders by Status Over time"
              type="stackedBar"
              :loading="loading"
              :result-set="resultSet"
            />
          </template>
        </query-builder>
      </div>
    </div>
  </div>
</template>

<script>
import cubejs from "@cubejs-client/core";
import { QueryBuilder } from "@cubejs-client/vue3";
import { QueryRenderer } from "@cubejs-client/vue3";

import Chart from "./components/Chart.vue";
import Table from "./components/Table.vue";

const cubejsApi = cubejs(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1OTQ2NjY4OTR9.0fdi5cuDZ2t3OSrPOMoc3B1_pwhnWj4ZmM3FHEX7Aus",
  {
    apiUrl:
      "https://awesome-ecom.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1",
  }
);

const cubejsApi2 = cubejs(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDc1NTg2MjksImV4cCI6MTcwNzY0NTAyOX0.VZIbz44QKj7RJ-h5-V-9Y4nZzk7prV1msKJ5kiPgHUs",
  {
    apiUrl: "http://localhost:4000/cubejs-api/v1",
  }
);

export default {
  name: "App",
  components: {
    Chart,
    QueryBuilder,
    QueryRenderer,
    Table,
  },
  data() {
    return {
      cubejsApi,
      cubejsApi2,
      usersQuery: { measures: ["Users.count"] },
      ticketQuery: { measures: ["glpi_tickets.count"] },
      totalOrdersQuery: { measures: ["Orders.count"] },
      shippedOrdersQuery: {
        measures: ["Orders.count"],
        filters: [
          {
            dimension: "Orders.status",
            operator: "equals",
            values: ["shipped"],
          },
        ],
      },
      lineQuery: {
        measures: ["Users.count"],
        timeDimensions: [
          {
            dimension: "Users.createdAt",
            dateRange: ["2019-01-01", "2020-12-31"],
            granularity: "month",
          },
        ],
      },
      barQuery: {
        measures: ["Orders.count"],
        dimensions: ["Orders.status"],
        timeDimensions: [
          {
            dimension: "Orders.createdAt",
            dateRange: ["2019-01-01", "2020-12-31"],
            granularity: "month",
          },
        ],
      },
      query: {
        measures: ["jumlah_tiket_berdasarkan_kategori_layanan_alltime.count"],
        order: {
          "jumlah_tiket_berdasarkan_kategori_layanan_alltime.count": "desc",
        },
        dimensions: [
          "jumlah_tiket_berdasarkan_kategori_layanan_alltime.unitkerja",
        ],
      },
      chartType: "line",
      pivotConfig: {
        x: ["jumlah_tiket_berdasarkan_kategori_layanan_alltime.unitkerja"],
        y: ["measures"],
        fillMissingDates: true,
        joinDateRange: false,
      },
    };
  },
  computed: {
    componentType() {
      if (this.chartType === "table" || this.chartType === "number") {
        return null;
      }

      return [
        this.chartType === "bar" ? "column" : this.chartType,
        "-chart",
      ].join("");
    },

    isStacked() {
      return this.chartType === "area";
    },
  },
  methods: {
    data(resultSet) {
      if (["line", "area"].includes(this.chartType)) {
        return this.series(resultSet);
      }

      if (this.chartType === "pie") {
        return this.pairs(resultSet);
      }

      if (this.chartType === "bar") {
        return this.seriesPairs(resultSet);
      }
    },

    series(resultSet) {
      if (!resultSet) {
        return [];
      }

      const seriesNames = resultSet.seriesNames();
      const pivot = resultSet.chartPivot();
      const series = [];
      seriesNames.forEach((e) => {
        const data = pivot.map((p) => [p.x, p[e.key]]);
        series.push({
          name: e.title,
          data,
        });
      });
      return series;
    },

    pairs(resultSet) {
      return resultSet.series()[0].series.map((item) => [item.x, item.value]);
    },

    seriesPairs(resultSet) {
      return resultSet.series().map((seriesItem) => ({
        name: seriesItem.title,
        data: seriesItem.series.map((item) => [item.x, item.value]),
      }));
    },
  },
};
</script>

<style>
html {
  -webkit-font-smoothing: antialiased;
}

body {
  padding-top: 30px;
  padding-bottom: 30px;
  background: #f5f6f7;
}
</style>
