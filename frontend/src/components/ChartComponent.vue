<template>
  <div class="h-80">
    <canvas :ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface Props {
  type: "line" | "doughnut" | "bar";
  data: any;
  options?: any;
  chartId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({}),
  chartId: "chart",
});

const chartRef = ref<HTMLCanvasElement>();
let chartInstance: Chart | null = null;

const createChart = () => {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartRef.value.getContext("2d");
  if (!ctx) return;

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: props.type === "doughnut" ? "bottom" : "top",
      },
    },
    ...(props.type === "line" && {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value: any) {
              return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(value));
            },
          },
        },
      },
    }),
  };

  chartInstance = new Chart(ctx, {
    type: props.type,
    data: props.data,
    options: { ...defaultOptions, ...props.options },
  });
};

const updateChart = () => {
  if (chartInstance && props.data) {
    chartInstance.data = props.data;
    chartInstance.update();
  }
};

watch(
  () => props.data,
  () => {
    if (chartInstance) {
      updateChart();
    } else {
      createChart();
    }
  },
  { deep: true }
);

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
