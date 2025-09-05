<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/http';

type Recurring = {
  _id?: string;
  name: string;
  type: 'INCOME'|'EXPENSE';
  category: string;
  amount: number;
  dayOfMonth: number;
  account?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string | null;
};

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);

const list = ref<Recurring[]>([]);
const form = ref<Recurring>({
  name: '',
  type: 'EXPENSE',
  category: '',
  amount: 0,
  dayOfMonth: 1,
  isActive: true,
});

async function load() {
  const res = await api.get('/api/recurring');
  list.value = res.data;
}

onMounted(load);

async function createRecurring() {
  if (!form.value.name || !form.value.category || !form.value.dayOfMonth) {
    alert('Preencha Nome, Categoria e Dia do mês.');
    return;
  }
  await api.post('/api/recurring', form.value);
  form.value = { name: '', type: 'EXPENSE', category: '', amount: 0, dayOfMonth: 1, isActive: true };
  await load();
}

async function toggleActive(r: Recurring) {
  await api.put(`/api/recurring/${r._id}`, { isActive: !r.isActive });
  await load();
}

async function remove(r: Recurring) {
  if (!confirm('Remover este recorrente?')) return;
  await api.delete(`/api/recurring/${r._id}`);
  await load();
}

async function genRecurring() {
  await api.post('/api/recurring/generate', null, { params: { year: year.value, month: month.value } });
  alert('Lançamentos de recorrentes gerados para o mês!');
}

async function genFinancing() {
  await api.post('/api/financing/generate', null, { params: { year: year.value, month: month.value } });
  alert('Parcela(s) de financiamento geradas!');
}
</script>

<template>
  <div>
    <div class="controls">
      <label>Ano: <input type="number" v-model.number="year"></label>
      <label>Mês: <input type="number" v-model.number="month" min="1" max="12"></label>
    </div>

    <div class="card">
      <h3>Adicionar Recorrente (Fixo)</h3>
      <div class="controls" style="flex-wrap: wrap;">
        <input placeholder="Nome (ex.: Aluguel)" v-model="form.name" />
        <select v-model="form.type">
          <option value="INCOME">Renda</option>
          <option value="EXPENSE">Gasto</option>
        </select>
        <input placeholder="Categoria (ex.: Moradia)" v-model="form.category" />
        <input placeholder="Valor" type="number" step="0.01" v-model.number="form.amount" />
        <input placeholder="Dia do mês" type="number" min="1" max="31" v-model.number="form.dayOfMonth" />
        <label><input type="checkbox" v-model="form.isActive" /> Ativo</label>
        <button class="primary" @click="createRecurring">Salvar Recorrente</button>
      </div>
    </div>

    <div class="card">
      <h3>Recorrentes cadastrados</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Valor</th>
            <th>Dia</th>
            <th>Ativo</th>
            <th style="width:160px;">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r._id">
            <td>{{ r.name }}</td>
            <td><span class="badge" :class="r.type === 'INCOME' ? 'income':'expense'">{{ r.type==='INCOME'?'Renda':'Gasto' }}</span></td>
            <td>{{ r.category }}</td>
            <td>{{ r.amount.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</td>
            <td>{{ r.dayOfMonth }}</td>
            <td>{{ r.isActive ? 'Sim' : 'Não' }}</td>
            <td>
              <button @click="toggleActive(r)">{{ r.isActive ? 'Desativar' : 'Ativar' }}</button>
              <button @click="remove(r)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3>Gerar mês</h3>
      <p>Use os botões abaixo para gerar automaticamente as despesas/receitas fixas e as parcelas de financiamentos para o mês selecionado.</p>
      <button class="primary" @click="genRecurring">Gerar Fixos (do mês)</button>
      <button class="primary" @click="genFinancing">Gerar Financiamentos (do mês)</button>
    </div>
  </div>
</template>
