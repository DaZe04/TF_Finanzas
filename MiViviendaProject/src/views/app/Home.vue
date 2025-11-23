<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

const loading = ref(true)
const role = ref(null)
const userName = ref('')
const router = useRouter()

onMounted(async () => {
  const user = auth.currentUser
  if (!user) {
    loading.value = false
    return
  }

  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  if (snap.exists()) {
    const userData = snap.data()
    role.value = userData.accountType // admin | agente
    userName.value = userData.fullName
  } else {
    userName.value = user.displayName || user.email
  }

  loading.value = false
})

const navigateTo = (path) => {
  if (path) {
    router.push(path)
  }
}
</script>

<template>
  <div class="home-view">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else class="home-content">
      <header class="home-header">
        <h1>Bienvenido, {{ userName }}</h1>
        <span v-if="role" class="role-badge">{{ role }}</span>
      </header>

      <div class="cards-grid">
        
        <!-- Card: Clientes -->
        <div class="card" @click="navigateTo('/app/clients')">
          <div class="card-icon" style="background-color: rgba(39, 174, 96, 0.1); color: #27ae60;">
            <span>👥</span>
          </div>
          <div class="card-content">
            <h3>Clientes</h3>
            <p>Gestionar la lista de clientes</p>
          </div>
        </div>

        <!-- Card: Inmobiliarias -->
        <div class="card" @click="navigateTo('/app/unidades')">
          <div class="card-icon" style="background-color: rgba(0, 115, 204, 0.1); color: #0073cc;">
            <span>🏢</span>
          </div>
          <div class="card-content">
            <h3>Inmobiliarias</h3>
            <p>Gestionar las unidades inmobiliarias</p>
          </div>
        </div>

        <!-- Card: Simulador -->
        <div class="card disabled">
          <div class="card-icon" style="background-color: rgba(243, 156, 18, 0.1); color: #f39c12;">
            <span>🧮</span>
          </div>
          <div class="card-content">
            <h3>Simulador</h3>
            <p>Calcular créditos y cuotas</p>
          </div>
        </div>

        <!-- Card: Configuración -->
        <div class="card" @click="navigateTo('/app/configuracion')">
          <div class="card-icon" style="background-color: rgba(142, 68, 173, 0.1); color: #8e44ad;">
            <span>⚙️</span>
          </div>
          <div class="card-content">
            <h3>Configuración</h3>
            <p>Ajustes tus parámetros financieros para simulaciones</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-header {
  margin-bottom: 2rem;
}

.home-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.role-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: var(--color-accent);
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.card {
  background-color: var(--color-card-background);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.card.disabled:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.card-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-content h3 {
  margin: 0 0 0.25rem 0;
  color: var(--color-text-primary);
  font-size: 1.1rem;
}

.card-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 92, 153, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
