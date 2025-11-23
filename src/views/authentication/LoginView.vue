<script setup>
import { ref } from 'vue'
import { auth } from '../../firebase/index.js'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const fieldErrors = ref({
  email: '',
  password: ''
})

const validateForm = () => {
  let isValid = true
  fieldErrors.value = {
    email: '',
    password: ''
  }

  if (!email.value.trim()) {
    fieldErrors.value.email = 'El correo electrónico es obligatorio'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    fieldErrors.value.email = 'El correo electrónico no es válido'
    isValid = false
  }

  if (!password.value) {
    fieldErrors.value.password = 'La contraseña es obligatoria'
    isValid = false
  }

  return isValid
}

const loginUser = async () => {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    // Redirigir al dashboard o página principal
    router.push('/home')
  } catch (error) {
    console.error('Error Firebase:', error)
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage.value = 'No existe una cuenta con este correo'
        break
      case 'auth/wrong-password':
        errorMessage.value = 'Contraseña incorrecta'
        break
      case 'auth/invalid-email':
        errorMessage.value = 'El correo electrónico no es válido'
        break
      case 'auth/user-disabled':
        errorMessage.value = 'Esta cuenta ha sido deshabilitada'
        break
      case 'auth/invalid-credential':
        errorMessage.value = 'Credenciales inválidas. Verifica tu correo y contraseña'
        break
      default:
        errorMessage.value = 'Error al iniciar sesión. Intenta nuevamente'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="header">
        <div class="icon-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <h2>FondoVivienda</h2>
        <p class="subtitle">Bienvenido de nuevo</p>
      </div>

      <form @submit.prevent="loginUser">
        <!-- Email -->
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="m2 7 10 6 10-6"></path>
            </svg>
            <input
              id="email"
              v-model="email"
              type="email"
              class="input"
              :class="{ 'input-error': fieldErrors.email }"
              placeholder="tu@correo.com"
              :disabled="isLoading"
            />
          </div>
          <span v-if="fieldErrors.email" class="error-message">{{ fieldErrors.email }}</span>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              id="password"
              v-model="password"
              type="password"
              class="input"
              :class="{ 'input-error': fieldErrors.password }"
              placeholder="Tu contraseña"
              :disabled="isLoading"
            />
          </div>
          <span v-if="fieldErrors.password" class="error-message">{{ fieldErrors.password }}</span>
        </div>

        <div class="forgot-password">
            <router-link to="/forgot-password" class="link">¿Olvidaste tu contraseña?</router-link>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="!isLoading">Iniciar sesión</span>
          <span v-else>Iniciando sesión...</span>
          <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </form>

      <transition name="fade">
        <div v-if="errorMessage" class="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ errorMessage }}
        </div>
      </transition>

      <div class="footer">
        <p>¿No tienes cuenta? <router-link to="/" class="link">Crea una cuenta</router-link> </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.login-container {
  max-width: 420px;
  width: 100%;
  padding: 2rem 2.25rem;
  background-color: var(--color-card-background);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.icon-circle {
  width: 56px;
  height: 56px;
  margin: 0 auto 0.85rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

h2 {
  color: var(--color-text-primary);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.4rem 0;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin: 0;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.9rem;
  color: var(--color-text-secondary);
  pointer-events: none;
  z-index: 1;
}

.input {
  width: 100%;
  padding: 0.8rem 0.9rem 0.8rem 2.6rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  background-color: var(--color-background);
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  background-color: white;
  box-shadow: 0 0 0 3px rgba(0, 92, 153, 0.1);
}

.input::placeholder {
  color: #9CA3AF;
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-error {
  border-color: var(--color-error) !important;
  background-color: rgba(231, 76, 60, 0.05);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.error-message {
  font-size: 0.8rem;
  color: var(--color-error);
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-message::before {
  content: "⚠";
  font-size: 0.875rem;
}

.forgot-password {
  text-align: right;
  margin-top: -0.5rem;
}

.forgot-password .link {
  font-size: 0.85rem;
}

.btn-primary {
  width: 100%;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.975rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 92, 153, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  padding: 0.9rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.alert-error {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.footer {
  text-align: center;
  padding-top: 1.25rem;
  border-top: 1px solid #E5E7EB;
}

.footer p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link:hover {
  color: var(--color-primary-light);
  text-decoration: underline;
}

/* Animaciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 640px) {
  .login-container {
    padding: 1.75rem 1.5rem;
    margin: 1rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }
}
</style>