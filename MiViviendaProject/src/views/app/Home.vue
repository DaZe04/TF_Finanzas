<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Componentes que mostraremos dinámicamente
import HomeAdminSection from '@/components/HomeAdminSection.vue'
import HomeAgentSection from '@/components/HomeAgentSection.vue'

const loading = ref(true)
const role = ref(null)

onMounted(async () => {
  const user = auth.currentUser
  if (!user) return

  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  if (snap.exists()) {
    role.value = snap.data().accountType // admin | agente
  }

  loading.value = false
})
</script>

<template>
  <div>

    <div v-if="loading" class="loading">
      Cargando información del usuario...
    </div>

    <HomeAdminSection v-else-if="role === 'administrador'" />

    <HomeAgentSection v-else-if="role === 'agente'" />

    <div v-else class="error">
      Rol no reconocido
    </div>

  </div>
</template>

<style scoped>
.loading {
  padding: 1rem;
  font-size: 1.1rem;
}
.error {
  padding: 1rem;
  color: #E63946;
}
</style>
