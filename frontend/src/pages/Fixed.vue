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
  installments?: number | null;
};

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);

const list = ref<Recurring[]>([]);
const fromYm = ref<string>(()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` } as any);
const toYm = ref<string>(()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` } as any);
const form = ref<Recurring>({
  name: '',
  type: 'EXPENSE',
  category: '',
  amount: 0,
  dayOfMonth: 1,
  startDate: new Date().toISOString().slice(0,10),
  installments: null,
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

function startEdit(r: Recurring) {
  editingId.value = r._id || null;
  editRow.value = { ...r } as any;
}

function cancelEdit(){ editingId.value = null; editRow.value = null; }

async function saveEdit(){
  if (!editingId.value || !editRow.value) return;
  await api.put(`/api/recurring/${editingId.value}`, editRow.value);
  editingId.value = null; editRow.value = null; await load();
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

async function genRange() {
  const from = typeof fromYm.value === 'function' ? fromYm.value() : fromYm.value;
  const to = typeof toYm.value === 'function' ? toYm.value() : toYm.value;
  await api.post('/api/recurring/generate-range', { from, to });
  alert('Fixos gerados para o período!');
  await load();
}

async function genFinancingRange(){
  if (!finFromYm.value || !finToYm.value) { alert('Preencha De/Até (YYYY-MM).'); return; }
  await api.post('/api/financing/generate-range', null, { params: { from: finFromYm.value, to: finToYm.value } });
  alert('Financiamentos gerados para o período!');
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
        <input placeholder="Início" type="date" v-model="form.startDate" />
        <input placeholder="Parcelas (vazio = infinito)" type="number" min="1" v-model.number="form.installments" />
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
            <th>Início</th>
            <th>Parcelas</th>
            <th style="width:220px;">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r._id">
            <template v-if="editingId === r._id">
              <td><input v-model="(editRow as any).name" /></td>
              <td>
                <select v-model="(editRow as any).type">
                  <option value="INCOME">Renda</option>
                  <option value="EXPENSE">Gasto</option>
                </select>
              </td>
              <td><input v-model="(editRow as any).category" /></td>
              <td><input type="number" step="0.01" v-model.number="(editRow as any).amount" /></td>
              <td><input type="number" min="1" max="31" v-model.number="(editRow as any).dayOfMonth" /></td>
              <td>
                <input type="checkbox" v-model="(editRow as any).isActive" />
              </td>
              <td>
                <input type="date" v-model="(editRow as any).startDate" />
              </td>
              <td>
                <input type="number" min="1" v-model.number="(editRow as any).installments" placeholder="∞" />
              </td>
              <td>
                <button class="clickable" @click="saveEdit">Salvar</button>
                <button class="clickable" @click="cancelEdit">Cancelar</button>
              </td>
            </template>
            <template v-else>
              <td>{{ r.name }}</td>
            <td><span class="badge" :class="r.type === 'INCOME' ? 'income':'expense'">{{ r.type==='INCOME'?'Renda':'Gasto' }}</span></td>
            <td>{{ r.category }}</td>
            <td>{{ r.amount.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</td>
            <td>{{ r.dayOfMonth }}</td>
            <td>{{ r.isActive ? 'Sim' : 'Não' }}</td>
            <td>{{ r.startDate ? new Date(r.startDate).toLocaleDateString('pt-BR') : '-' }}</td>
            <td>{{ r.installments ?? '∞' }}</td>
            <td>
              <button class="clickable" @click="startEdit(r)">Editar</button>
              <button class="clickable" @click="toggleActive(r)">{{ r.isActive ? 'Desativar' : 'Ativar' }}</button>
              <button class="clickable" @click="remove(r)">Excluir</button>
            </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3>Gerar por Período (somente Fixos)</h3>
      <div class="controls" style="flex-wrap: wrap;">
        <label>De: <input type="month" v-model="fromYm"></label>
        <label>Até: <input type="month" v-model="toYm"></label>
        <button class="primary" @click="genRange">Gerar Fixos no Período</button>
      </div>
    </div>

    <div class="card">
      <h3>Gerar Fixos para PERÍODO</h3>
      <div class="controls" style="flex-wrap: wrap;">
        <label>De: <input type="month" v-model="fromYm" /></label>
        <label>Até: <input type="month" v-model="toYm" /></label>
        <button class="primary clickable" @click="genRecurringRange">Gerar Fixos no período</button>
      </div>
    </div>

    <div class="card">
      <h3>Gerar Financiamentos para PERÍODO</h3>
      <div class="controls" style="flex-wrap: wrap;">
        <label>De: <input type="month" v-model="finFromYm" /></label>
        <label>Até: <input type="month" v-model="finToYm" /></label>
        <button class="primary clickable" @click="genFinancingRange">Gerar Financiamentos no período</button>
      </div>
    </div>

    <div class="card">
      <h3>Gerar mês</h3>
      <p>Use os botões abaixo para gerar automaticamente as despesas/receitas fixas e as parcelas de financiamentos para o mês selecionado.</p>
      <button class="primary" @click="genRecurring">Gerar Fixos (do mês)</button>
      <button class="primary" @click="genFinancing">Gerar Financiamentos (do mês)</button>
    </div>
  </div>
</template>
