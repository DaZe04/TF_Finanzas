<script setup>
import { ref } from 'vue'
import { auth, db } from '../../firebase/index.js'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

const email = ref('')
const password = ref('')
const fullName = ref('')
const dni = ref('')
const accountType = ref('')
const phone = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const fieldErrors = ref({
  email: '',
  password: '',
  fullName: '',
  dni: '',
  accountType: '',
  phone: ''
})

const validateForm = () => {
  let isValid = true
  fieldErrors.value = {
    email: '',
    password: '',
    fullName: '',
    dni: '',
    accountType: '',
    phone: ''
  }

  if (!fullName.value.trim()) {
    fieldErrors.value.fullName = 'El nombre completo es obligatorio'
    isValid = false
  }

  if (!dni.value.trim()) {
    fieldErrors.value.dni = 'El DNI es obligatorio'
    isValid = false
  } else if (!/^\d{8}$/.test(dni.value.trim())) {
    fieldErrors.value.dni = 'El DNI debe tener 8 dígitos'
    isValid = false
  }

  if (!accountType.value) {
    fieldErrors.value.accountType = 'Debes seleccionar un tipo de cuenta'
    isValid = false
  }

  if (!phone.value.trim()) {
    fieldErrors.value.phone = 'El teléfono de contacto es obligatorio'
    isValid = false
  } else if (!/^\d{9}$/.test(phone.value.trim())) {
    fieldErrors.value.phone = 'El teléfono debe tener 9 dígitos'
    isValid = false
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
  } else if (password.value.length < 6) {
    fieldErrors.value.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  return isValid
}

const registerUser = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    await setDoc(doc(db, 'users', user.uid), {
      fullName: fullName.value,
      dni: dni.value,
      accountType: accountType.value,
      phone: phone.value,
      email: email.value,
      createdAt: new Date()
    })
    
    // Aquí guardar los datos adicionales en Firestore
    successMessage.value = 'Usuario registrado correctamente 🎉'
    
    // Limpiar formulario
    email.value = ''
    password.value = ''
    fullName.value = ''
    dni.value = ''
    accountType.value = ''
    phone.value = ''
    fieldErrors.value = {
      email: '',
      password: '',
      fullName: '',
      dni: '',
      accountType: '',
      phone: ''
    }
  } catch (error) {
    console.error('Error Firebase:', error)
    
    // Mensajes de error
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage.value = 'Este correo ya está registrado'
        break
      case 'auth/invalid-email':
        errorMessage.value = 'El correo electrónico no es válido'
        break
      case 'auth/weak-password':
        errorMessage.value = 'La contraseña es muy débil'
        break
      default:
        errorMessage.value = 'Error al registrar usuario. Intenta nuevamente'
    }
  }
}
</script>

<template>
  <div class="register-wrapper">
    <div class="register-container">
      <div class="header">
        <div class="icon-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <h2>FondoVivienda</h2>
        <p class="subtitle">Completa tus datos para crear tu cuenta</p>
      </div>

      <form @submit.prevent="registerUser">
        <div class="form-row">
          <!-- Nombre Completo -->
          <div class="form-group">
            <label for="fullName">Nombre completo</label>
            <div class="input-wrapper">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                id="fullName"
                v-model="fullName"
                type="text"
                class="input"
                :class="{ 'input-error': fieldErrors.fullName }"
                placeholder="Nombre y apellidos"
              />
            </div>
            <span v-if="fieldErrors.fullName" class="error-message">{{ fieldErrors.fullName }}</span>
          </div>

          <!-- DNI -->
          <div class="form-group">
            <label for="dni">DNI</label>
            <div class="input-wrapper">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <input
                id="dni"
                v-model="dni"
                type="text"
                class="input"
                :class="{ 'input-error': fieldErrors.dni }"
                placeholder="12345678"
                maxlength="8"
              />
            </div>
            <span v-if="fieldErrors.dni" class="error-message">{{ fieldErrors.dni }}</span>
          </div>
        </div>

        <div class="form-row">
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
            />
          </div>
          <span v-if="fieldErrors.email" class="error-message">{{ fieldErrors.email }}</span>
        </div>
          

          <!-- Teléfono -->
          <div class="form-group">
            <label for="phone">Teléfono</label>
            <div class="input-wrapper">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <input
                id="phone"
                v-model="phone"
                type="tel"
                class="input"
                :class="{ 'input-error': fieldErrors.phone }"
                placeholder="987654321"
                maxlength="9"
              />
            </div>
            <span v-if="fieldErrors.phone" class="error-message">{{ fieldErrors.phone }}</span>
          </div>
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
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <span v-if="fieldErrors.password" class="error-message">{{ fieldErrors.password }}</span>
        </div>


        <!-- Tipo de Cuenta -->
          <div class="form-group">
            <label for="accountType">Tipo de cuenta</label>
            <div class="input-wrapper">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <select
                id="accountType"
                v-model="accountType"
                class="input select"
                :class="{ 'input-error': fieldErrors.accountType }"
              >
                <option value="" disabled>Selecciona</option>
                <option value="agente">Agente</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <span v-if="fieldErrors.accountType" class="error-message">{{ fieldErrors.accountType }}</span>
          </div>

       

        <button type="submit" class="btn-primary">
          <span>Crear cuenta</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </form>

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

      <div class="footer">
        <p>¿Ya tienes cuenta? <router-link to="/login" class="link">Iniciar Sesión</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.register-container {
  max-width: 450px;
  width: 100%;
  padding: 1.75rem 2rem;
  background-color: var(--color-card-background);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.header {
  text-align: center;
  margin-bottom: 1.25rem;
}

.icon-circle {
  width: 52px;
  height: 52px;
  margin: 0 auto 0.75rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

h2 {
  color: var(--color-text-primary);
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.35rem 0;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

label {
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 0.85rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--color-text-secondary);
  pointer-events: none;
  z-index: 1;
}

.input {
  width: 100%;
  padding: 0.7rem 0.85rem 0.7rem 2.5rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.9rem;
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

.input-error {
  border-color: var(--color-error) !important;
  background-color: rgba(231, 76, 60, 0.05);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.error-message {
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-message::before {
  content: "⚠";
  font-size: 0.85rem;
}

.select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236C7A89' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
  padding-right: 2.5rem;
  cursor: pointer;
}

.select option {
  padding: 0.5rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 92, 153, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.alert {
  padding: 0.85rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.85rem;
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

.footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.footer p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
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
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .register-container {
    max-width: 480px;
  }
}

@media (max-width: 640px) {
  .register-container {
    padding: 1.5rem;
    margin: 1rem;
  }

  h2 {
    font-size: 1.4rem;
  }
}
</style>