<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../api/http';

type Tx = {
  _id?: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description?: string;
  plannedAmount?: number;
  amount?: number;
  account?: string;
  isFixed?: boolean;
  status?: 'PLANNED' | 'PAID';
};

const now = new Date();
const dateRef = ref(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
function function getYear(){ const d = new Date(dateRef.value); return d.getFullYear(); }
function function getMonth(){ const d = new Date(dateRef.value); return d.getMonth() + 1; }
const list = ref<Tx[]>([]);

async function load() {
  const year = getYear(); const month = getMonth();
  await Promise.allSettled([
    api.post('/api/recurring/generate', null, { params: { year, month } }),
    api.post('/api/financing/generate', null, { params: { year, month } }),
  ]);
  const res = await api.get('/api/transactions', { params: { year, month } });
  list.value = res.data;
}

onMounted(load);
watch([dateRef], load);

const form = ref<Tx>({
  date: new Date().toISOString().slice(0,10),
  type: 'EXPENSE',
  category: '',
  description: '',
  plannedAmount: undefined,
  amount: undefined,
  isFixed: false,
  status: 'PLANNED',
});

async function save() {
  await api.post('/api/transactions', form.value);
  form.value = {
    date: new Date().toISOString().slice(0,10),
    type: 'EXPENSE',
    category: '',
    description: '',
    plannedAmount: undefined,
    amount: undefined,
    isFixed: false,
    status: 'PLANNED',
  };
  await load();
}

const editingId = ref<string | null>(null);
const editRow = ref<Tx | null>(null);

function startEdit(tx: Tx) {
  editingId.value = tx._id || null;
  editRow.value = { ...tx, date: (tx.date || '').slice(0,10) };
}

function cancelEdit() {
  editingId.value = null;
  editRow.value = null;
}

async function commitEdit() {
  if (!editingId.value || !editRow.value) return;
  await api.put(`/api/transactions/${editingId.value}`, editRow.value);
  editingId.value = null;
  editRow.value = null;
  await load();
}

async function pay(tx: Tx) {
  const amount = (tx.amount ?? tx.plannedAmount ?? 0);
  await api.post(`/api/transactions/${tx._id}/pay`, { amount });
  await load();
}

async function remove(id?: string) {
  if (!id) return;
  if (!confirm('Remover esta transação?')) return;
  await api.delete(`/api/transactions/${id}`);
  await load();
}
</script>

<template>
  <div>
    <div class="controls">
      <label>Data de referência: <input type="date" v-model="dateRef"></label>
      <button class="primary" @click="load">Atualizar</button>
    </div>

    <div class="card">
      <h3>Adicionar Transação</h3>
      <div class="controls" style="flex-wrap: wrap;">
        <select v-model="form.type">
          <option value="INCOME">Renda</option>
          <option value="EXPENSE">Gasto</option>
        </select>
        <input placeholder="Data" type="date" v-model="form.date" />
        <input placeholder="Categoria" v-model="form.category" />
        <input placeholder="Descrição" v-model="form.description" />
        <input placeholder="Previsto" type="number" step="0.01" v-model.number="form.plannedAmount" />
        <input placeholder="Real" type="number" step="0.01" v-model.number="form.amount" />
        <label><input type="checkbox" v-model="form.isFixed" /> Fixo</label>
        <select v-model="form.status">
          <option value="PLANNED">Previsto</option>
          <option value="PAID">Pago</option>
        </select>
        <button class="primary" @click="save">Salvar</button>
      </div>
    </div>

    <div class="card">
      <h3>Transações</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Previsto</th>
            <th>Real</th>
            <th>Status</th>
            <th style="width:160px;">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in list" :key="tx._id">
            <template v-if="editingId === tx._id">
              <td><input type="date" v-model="(editRow as any).date" /></td>
              <td>
                <select v-model="(editRow as any).type">
                  <option value="INCOME">Renda</option>
                  <option value="EXPENSE">Gasto</option>
                </select>
              </td>
              <td><input v-model="(editRow as any).category" /></td>
              <td><input v-model="(editRow as any).description" /></td>
              <td><input type="number" step="0.01" v-model.number="(editRow as any).plannedAmount" /></td>
              <td><input type="number" step="0.01" v-model.number="(editRow as any).amount" /></td>
              <td>
                <select v-model="(editRow as any).status">
                  <option value="PLANNED">Previsto</option>
                  <option value="PAID">Pago</option>
                </select>
              </td>
              <td>
                <button class="primary" @click="commitEdit">Salvar</button>
                <button @click="cancelEdit">Cancelar</button>
              </td>
            </template>
            <template v-else>
              <td>{{ new Date(tx.date).toLocaleDateString('pt-BR') }}</td>
              <td><span class="badge" :class="tx.type === 'INCOME' ? 'income':'expense'">{{ tx.type==='INCOME'?'Renda':'Gasto' }}</span></td>
              <td>{{ tx.category }}</td>
              <td>{{ tx.description }}</td>
              <td>{{ (tx.plannedAmount ?? 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}</td>
              <td :class="(tx.amount ?? 0) >= 0 ? 'positive' : 'negative'">
                {{ (tx.amount ?? 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) }}
              </td>
              <td>{{ tx.status }}</td>
              <td>
                <button class="clickable" @click="startEdit(tx)">Editar</button>
                <button class="clickable" @click="pay(tx)">Pagar</button>
                <button class="clickable" @click="remove(tx._id)">Excluir</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
