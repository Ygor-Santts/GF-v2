<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Modern Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ease-out border-r border-slate-200/50"
      :class="
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      "
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between h-20 px-6 border-b border-slate-100"
      >
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div
              class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <DollarSign class="w-6 h-6 text-white" />
            </div>
            <div
              class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            ></div>
          </div>
          <div>
            <h1
              class="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
            >
              FinanceFlow
            </h1>
            <p class="text-xs text-slate-500">Gestão Inteligente</p>
          </div>
        </div>
        <button
          @click="sidebarOpen = false"
          class="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="mt-8 px-4">
        <div class="space-y-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden"
            :class="
              $route.path === item.href
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            "
            @click="sidebarOpen = false"
          >
            <component
              :is="item.icon"
              class="mr-4 h-5 w-5 flex-shrink-0 transition-transform duration-200"
              :class="
                $route.path === item.href
                  ? 'text-white scale-110'
                  : 'text-slate-400 group-hover:text-slate-600 group-hover:scale-105'
              "
            />
            <span class="font-medium">{{ item.name }}</span>
            <div
              v-if="$route.path === item.href"
              class="absolute right-3 w-2 h-2 bg-white rounded-full opacity-75"
            ></div>
          </router-link>
        </div>
      </nav>

      <!-- Quick Stats -->
      <div
        class="mt-8 mx-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-slate-600">Saldo Atual</span>
          <TrendingUp class="w-4 h-4 text-emerald-500" />
        </div>
        <p class="text-2xl font-bold text-slate-800">R$ 12.450</p>
        <p class="text-xs text-emerald-600 mt-1">+12% este mês</p>
      </div>

      <!-- User Profile -->
      <div
        class="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm"
      >
        <div
          class="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
        >
          <div class="relative">
            <div
              class="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full flex items-center justify-center"
            >
              <User class="w-5 h-5 text-white" />
            </div>
            <div
              class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            ></div>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800">João Silva</p>
            <p class="text-xs text-slate-500">Conta Premium</p>
          </div>
          <Settings class="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="lg:pl-72">
      <!-- Top Bar -->
      <div
        class="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
      >
        <div class="flex h-16 items-center justify-between px-6">
          <!-- Mobile Menu Button -->
          <button
            @click="sidebarOpen = true"
            class="lg:hidden p-2 rounded-xl bg-white shadow-md text-slate-600 hover:text-slate-800 hover:shadow-lg transition-all duration-200"
          >
            <Menu class="w-5 h-5" />
          </button>

          <!-- Page Title -->
          <div class="flex-1 lg:flex-none">
            <h2 class="text-lg font-semibold text-slate-800 lg:hidden">
              {{ currentPageTitle }}
            </h2>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-3">
            <button
              class="p-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
            >
              <Bell class="w-5 h-5" />
            </button>
            <button
              class="p-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
            >
              <Search class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <main class="p-6">
        <router-view />
      </main>
    </div>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import {
  DollarSign,
  Home,
  CreditCard,
  RotateCcw,
  FileText,
  BarChart3,
  Settings,
  User,
  TrendingUp,
  X,
  Menu,
  Bell,
  Search,
} from "lucide-vue-next";

const route = useRoute();
const sidebarOpen = ref(false);

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Transações", href: "/transactions", icon: CreditCard },
  { name: "Recorrentes", href: "/recurring", icon: RotateCcw },
  { name: "Financiamentos", href: "/financing", icon: FileText },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Configurações", href: "/settings", icon: Settings },
];

const currentPageTitle = computed(() => {
  const currentNav = navigation.find((nav) => nav.href === route.path);
  return currentNav?.name || "Dashboard";
});
</script>
