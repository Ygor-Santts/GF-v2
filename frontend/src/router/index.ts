import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import Transactions from '../pages/Transactions.vue';
import Fixed from '../pages/Fixed.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/transactions', component: Transactions },
  { path: '/fixed', component: Fixed },
];

const router = createRouter({ history: createWebHistory(), routes });
export default router;
