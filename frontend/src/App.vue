<template>
  <div class="app">
    <header class="header">
      <h1>GF-v2</h1>
      <nav>
        <router-link to="/">Dashboard</router-link> |
        <router-link to="/transactions">Transações</router-link> |
        <router-link to="/fixed">Fixos & Financiamentos</router-link>
      </nav>
    </header>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<style>
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #eee; }
.container { padding: 20px; max-width: 1100px; margin: 0 auto; }
.card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #eee; padding: 8px 10px; text-align: left; font-size: 14px;}
.badge { padding: 2px 8px; border-radius: 999px; font-size: 12px; }
.badge.income { background: #DCFCE7; color: #166534; }
.badge.expense { background: #FEE2E2; color: #991B1B; }
.positive { color: #16a34a; font-weight: 600; }
.negative { color: #dc2626; font-weight: 600; }
.controls { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
input, select, button { padding: 8px 10px; border-radius: 8px; border: 1px solid #e5e7eb; }
button.primary { background: #111827; color: white; }
.clickable { cursor: pointer; }
</style>
