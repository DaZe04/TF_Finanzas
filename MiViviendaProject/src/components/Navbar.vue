<template>
  <header class="navbar">
    <!-- Lado Izquierdo: Botón de Hamburguesa -->
    <div class="navbar-left">
      <button @click="toggleSidebar" class="hamburger-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    </div>

    <!-- Lado Derecho: Menú de Usuario -->
    <div class="navbar-right">
      <div v-if="user" class="user-menu" ref="userMenuRef">
        <button @click="toggleUserDropdown" class="user-button">
          <span class="user-name">{{ user.displayName || user.email }}</span>
          <div class="user-avatar">{{ user.displayName ? user.displayName.charAt(0).toUpperCase() : '?' }}</div>
        </button>

        <transition name="fade-down">
          <div v-if="isUserDropdownOpen" class="user-dropdown">
            <div class="dropdown-header">
              <strong>{{ user.displayName || 'Usuario' }}</strong>
              <small>{{ user.email }}</small>
            </div>
            <button @click="handleLogout" class="logout-button">
              <span>Cerrar Sesión</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const emit = defineEmits(['toggle-sidebar']);
const router = useRouter();

const user = ref(null);
const isUserDropdownOpen = ref(false);
const userMenuRef = ref(null);

onMounted(() => {
  user.value = auth.currentUser;
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const toggleSidebar = () => {
  emit('toggle-sidebar');
};

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
};

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isUserDropdownOpen.value = false;
  }
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 1.5rem;
  background-color: var(--color-card-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.hamburger-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}
.hamburger-button:hover {
  background-color: rgba(0,0,0,0.05);
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 20px;
  transition: background-color 0.2s ease;
}
.user-button:hover {
  background-color: rgba(0,0,0,0.05);
}

.user-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
}
.dropdown-header small {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.logout-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  color: var(--color-error);
  font-weight: 500;
}
.logout-button:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.fade-down-enter-active, .fade-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-down-enter-from, .fade-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>