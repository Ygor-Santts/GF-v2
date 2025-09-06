<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../api/http';

const now = new Date();
const ym = ref(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
function getYear(){ return Number(ym.value.split('-')[0]); }
function getMonth(){ return Number(ym.value.split('-')[1]); }

const data = ref<any>(null);

async function load() {
  const res = await api.get('/api/reports/monthly', { params: { year: getYear(), month: getMonth() } });
  data.value = res.data;
}
onMounted(load);
watch([ym], load);
</script>

<template>
  <div>
    <div class="controls">
      <label>Mês: <input type="month" v-model="ym"></label>
      <button class="primary" @click="load">Atualizar</button>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Renda</h3>
        <p>Previsto: <b class="positive">{{ data?.incomePlanned?.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</b></p>
        <p>Real: <b class="positive">{{ data?.incomeReal?.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</b></p>
      </div>
      <div class="card">
        <h3>Gastos</h3>
        <p>Previsto: <b class="negative">{{ data?.expensePlanned?.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</b></p>
        <p>Real: <b class="negative">{{ data?.expenseReal?.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</b></p>
      </div>
      <div class="card">
        <h3>Saldo</h3>
        <p>Previsto: <b :class="data?.netPlanned>=0?'positive':'negative'">{{ data?.netPlanned?.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</b></p>
        <p>Real: <b :class="data?.netReal>=0?'positive':'negative'">{{ data?.netReal?.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</b></p>
        <p>% Gastos sobre Renda: <b>{{ data?.spendPct?.toFixed(1) }}%</b></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
</style>
