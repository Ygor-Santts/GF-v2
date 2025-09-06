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
  startDate?: string;
  endDate?: string | null;
  installments?: number | null;
  account?: string;
  isActive?: boolean;
};

const list = ref<Recurring[]>([]);
const form = ref<Recurring>({
  name: '',
  type: 'EXPENSE',
  category: '',
  amount: 0,
  dayOfMonth: 1,
  startDate: new Date().toISOString().slice(0,10),
  endDate: null,
  installments: null,
  isActive: true,
});

async function load() {
  const res = await api.get('/api/recurring');
  list.value = res.data;
}
onMounted(load);

async function createRecurring() {
  if (!form.value.name || !form.value.category) { alert('Preencha nome e categoria'); return; }
  await api.post('/api/recurring', form.value); // auto-seed no backend
  form.value = { name:'', type:'EXPENSE', category:'', amount:0, dayOfMonth:1, startDate:new Date().toISOString().slice(0,10), endDate:null, installments:null, isActive:true };
  await load();
}

// edição inline
const editingId = ref<string|null>(null);
const editRow = ref<Recurring|null>(null);
function startEdit(r: Recurring){ editingId.value = r._id || null; editRow.value = { ...r }; }
function cancelEdit(){ editingId.value = null; editRow.value = null; }
async function saveEdit(){
  if (!editingId.value || !editRow.value) return;
  await api.put(`/api/recurring/${editingId.value}`, editRow.value); // backend re-semeia
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
</script>

<template>
  <div class="card">
    <h3>Novo Recorrente</h3>
    <div class="controls">
      <input placeholder="Nome" v-model="form.name" />
      <select v-model="form.type">
        <option value="INCOME">Renda</option>
        <option value="EXPENSE">Gasto</option>
      </select>
      <input placeholder="Categoria" v-model="form.category" />
      <input placeholder="Valor" type="number" step="0.01" v-model.number="form.amount" />
      <input placeholder="Dia do mês" type="number" min="1" max="31" v-model.number="form.dayOfMonth" />
      <input placeholder="Início" type="date" v-model="form.startDate" />
      <input placeholder="Término (opcional)" type="date" v-model="form.endDate" />
      <input placeholder="Parcelas (vazio = infinito)" type="number" min="1" v-model.number="form.installments" />
      <label><input type="checkbox" v-model="form.isActive" /> Ativo</label>
      <button class="primary" @click="createRecurring">Salvar</button>
    </div>
  </div>

  <div class="card">
    <h3>Recorrentes</h3>
    <table class="table">
      <thead>
        <tr>
          <th>Nome</th><th>Tipo</th><th>Categoria</th><th>Valor</th><th>Dia</th>
          <th>Início</th><th>Término</th><th>Parcelas</th><th>Ativo</th><th style="width:220px;">Ações</th>
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
            <td><input type="date" v-model="(editRow as any).startDate" /></td>
            <td><input type="date" v-model="(editRow as any).endDate" /></td>
            <td><input type="number" min="1" v-model.number="(editRow as any).installments" placeholder="∞" /></td>
            <td><input type="checkbox" v-model="(editRow as any).isActive" /></td>
            <td>
              <button class="clickable" @click="saveEdit">Salvar</button>
              <button class="clickable" @click="cancelEdit">Cancelar</button>
            </td>
          </template>
          <template v-else>
            <td>{{ r.name }}</td>
            <td><span class="badge" :class="r.type==='INCOME'?'income':'expense'">{{ r.type==='INCOME'?'Renda':'Gasto' }}</span></td>
            <td>{{ r.category }}</td>
            <td>{{ r.amount.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) }}</td>
            <td>{{ r.dayOfMonth }}</td>
            <td>{{ r.startDate ? new Date(r.startDate).toLocaleDateString('pt-BR') : '-' }}</td>
            <td>{{ r.endDate ? new Date(r.endDate).toLocaleDateString('pt-BR') : '-' }}</td>
            <td>{{ r.installments ?? '∞' }}</td>
            <td>{{ r.isActive ? 'Sim' : 'Não' }}</td>
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
</template>
