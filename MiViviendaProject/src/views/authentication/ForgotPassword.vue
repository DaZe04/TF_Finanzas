<script setup>
import { ref } from 'vue'
import { auth } from '@/firebase/index.js'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const emailSent = ref(false)
const fieldErrors = ref({
  email: ''
})

const validateForm = () => {
  fieldErrors.value.email = ''

  if (!email.value.trim()) {
    fieldErrors.value.email = 'El correo electrónico es obligatorio'
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    fieldErrors.value.email = 'El correo electrónico no es válido'
    return false
  }

  return true
}

const resetPassword = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await sendPasswordResetEmail(auth, email.value)
    emailSent.value = true
    successMessage.value = 'Se ha enviado un correo con instrucciones para restablecer tu contraseña'
    
    // Opcional: redirigir al login después de 5 segundos
    setTimeout(() => {
      router.push('/login')
    }, 5000)
  } catch (error) {
    console.error('Error Firebase:', error)
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage.value = 'No existe una cuenta con este correo electrónico'
        break
      case 'auth/invalid-email':
        errorMessage.value = 'El correo electrónico no es válido'
        break
      case 'auth/too-many-requests':
        errorMessage.value = 'Demasiados intentos. Intenta de nuevo más tarde'
        break
      default:
        errorMessage.value = 'Error al enviar el correo. Intenta nuevamente'
    }
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/login')
}
</script>

<template>
  <div class="forgot-password-wrapper">
    <div class="forgot-password-container">
      <!-- Back button -->
      <button class="back-button" @click="goBack" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        Volver
      </button>

      <div class="header">
        <div class="icon-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p class="subtitle">
          {{ emailSent 
            ? 'Revisa tu bandeja de entrada' 
            : 'Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña' 
          }}
        </p>
      </div>

      <form v-if="!emailSent" @submit.prevent="resetPassword">
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
              autofocus
            />
          </div>
          <span v-if="fieldErrors.email" class="error-message">{{ fieldErrors.email }}</span>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="!isLoading">Enviar instrucciones</span>
          <span v-else>Enviando...</span>
          <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>

      <!-- Success state -->
      <div v-if="emailSent" class="success-state">
        <div class="email-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m2 7 10 6 10-6"></path>
          </svg>
        </div>
        <p class="email-sent-text">
          Hemos enviado un correo a <strong>{{ email }}</strong> con un enlace para restablecer tu contraseña.
        </p>
        <div class="help-text">
          <p>No olvides revisar tu carpeta de spam o correo no deseado.</p>
        </div>
        <button @click="goBack" class="btn-secondary">
          Volver al inicio de sesión
        </button>
      </div>

      <transition name="fade">
        <div v-if="successMessage" class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {{ successMessage }}
        </div>
      </transition>

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
    </div>
  </div>
</template>

<style scoped>
.forgot-password-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.forgot-password-container {
  max-width: 440px;
  width: 100%;
  padding: 2rem 2.25rem;
  background-color: var(--color-card-background);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  position: relative;
}

.back-button {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
}

.header {
  text-align: center;
  margin-bottom: 1.75rem;
  margin-top: 1rem;
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
  font-size: 1.65rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
  padding: 0 0.5rem;
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
  padding: 0.85rem 0.9rem 0.85rem 2.6rem;
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

.btn-secondary {
  width: 100%;
  padding: 0.85rem 1.25rem;
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-secondary:hover {
  background-color: rgba(0, 92, 153, 0.05);
  transform: translateY(-2px);
}

.success-state {
  text-align: center;
  padding: 1rem 0;
}

.email-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.25rem;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-success);
}

.email-sent-text {
  color: var(--color-text-primary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.email-sent-text strong {
  color: var(--color-primary);
  font-weight: 600;
}

.help-text {
  background-color: rgba(0, 92, 153, 0.05);
  padding: 0.85rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.help-text p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
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

.alert-success {
  background-color: rgba(39, 174, 96, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.alert-error {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(231, 76, 60, 0.3);
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
  .forgot-password-container {
    padding: 1.75rem 1.5rem;
    margin: 1rem;
  }

  .back-button {
    top: 1rem;
    left: 1rem;
  }

  h2 {
    font-size: 1.4rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }
}
</style>