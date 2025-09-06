<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../api/http';

const now = new Date();
const dateRef = ref(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
function function getYear(){ const d = new Date(dateRef.value); return d.getFullYear(); }
function function getMonth(){ const d = new Date(dateRef.value); return d.getMonth() + 1; }
const data = ref<any>(null);

async function load() {
  // garante geração do mês (idempotente)
  const year = getYear(); const month = getMonth();
  await Promise.allSettled([
    api.post('/api/recurring/generate', null, { params: { year, month } }),
    api.post('/api/financing/generate', null, { params: { year, month } }),
  ]);
  const res = await api.get('/api/reports/monthly', { params: { year, month } });
  data.value = res.data;
}
onMounted(load);
watch([dateRef], load);
</script>

<template>
  <div>
    <div class="controls">
      <label>Data de referência: <input type="date" v-model="dateRef"></label>
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

    <div class="card" v-if="data?.byType">
      <h3>Resumo por Tipo</h3>
      <table class="table">
        <thead>
          <tr><th></th><th>Previsto</th><th>Real</th></tr>
        </thead>
        <tbody>
          <tr><td>Fixos</td><td>{{ data.byType.Fixed.planned.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</td><td>{{ data.byType.Fixed.real.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</td></tr>
          <tr><td>Variáveis</td><td>{{ data.byType.Variable.planned.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</td><td>{{ data.byType.Variable.real.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card" v-if="data?.byCategory">
      <h3>Por Categoria</h3>
      <table class="table">
        <thead><tr><th>Categoria</th><th>Tipo</th><th>Previsto</th><th>Real</th></tr></thead>
        <tbody>
          <tr v-for="(row, cat) in data.byCategory" :key="cat">
            <td>{{ cat }}</td>
            <td><span class="badge" :class="row.type==='INCOME'?'income':'expense'">{{ row.type==='INCOME'?'Renda':'Gasto' }}</span></td>
            <td>{{ row.planned.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</td>
            <td>{{ row.real.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
</style>
