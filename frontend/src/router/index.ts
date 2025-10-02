import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import Transactions from "../pages/Transactions.vue";
import Recurring from "../pages/Recurring.vue";
import Financing from "../pages/Financing.vue";
import Reports from "../pages/Reports.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/transactions", component: Transactions },
  { path: "/recurring", component: Recurring },
  { path: "/financing", component: Financing },
  { path: "/reports", component: Reports },
];

const router = createRouter({ history: createWebHistory(), routes });
export default router;
