<template>
  <UnidadSearchModal 
    :is-open="isUnidadModalOpen" 
    @close="isUnidadModalOpen = false" 
    @unidad-seleccionada="handleUnidadSeleccionada" 
  />

  <div class="container">
    <div class="page-header">
      <h1>Nueva Simulación</h1>
      <p class="subtitle">Completa los datos para generar una simulación financiera</p>
    </div>

    <form @submit.prevent="crearSimulacion" class="simulation-form">
      
      <!-- NOMBRE DE LA SIMULACIÓN -->
      <div class="form-section">
        <h3 class="section-title">Información General</h3>
        
        <div class="form-group">
          <label for="nombre">Nombre de la Simulación</label>
          <input 
            id="nombre"
            type="text" 
            v-model="nombreSimulacion" 
            required 
            placeholder="Ej: Simulación para Cliente X" 
          />
        </div>

        <!-- MONTO -->
        <div class="form-group">
          <label for="monto">Monto del Crédito</label>
          <div class="input-with-prefix">
            <span class="prefix">S/</span>
            <input 
              id="monto"
              type="number" 
              v-model="monto" 
              required
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <!-- CLIENTE -->
      <div class="form-section">
        <h3 class="section-title">Cliente</h3>
        
        <div class="form-group">
          <label for="dni">Buscar Cliente por DNI</label>
          <div class="search-container">
            <input 
              id="dni"
              type="text" 
              v-model="dniBusqueda" 
              placeholder="Ingrese 8 dígitos del DNI"
              maxlength="8"
            />
            <button 
              type="button" 
              @click="buscarClientePorDni" 
              :disabled="!dniBusqueda"
              class="btn-search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              Buscar
            </button>
          </div>
          
          <div v-if="clienteEncontrado" class="info-card success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div>
              <strong>Cliente encontrado</strong>
              <p>{{ clienteEncontrado.fullName }}</p>
            </div>
          </div>
          
          <p v-if="errorBusquedaCliente" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ errorBusquedaCliente }}
          </p>
        </div>
      </div>

      <!-- UNIDAD -->
      <div class="form-section">
        <h3 class="section-title">Unidad Inmobiliaria</h3>
        
        <div class="form-group">
          <label>Seleccionar Unidad</label>
          <button 
            type="button" 
            @click="isUnidadModalOpen = true" 
            class="btn-select-unit"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
            {{ unidadSeleccionada ? 'Cambiar Unidad' : 'Buscar Unidad' }}
          </button>
          
          <div v-if="unidadSeleccionada" class="info-card info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <div>
              <strong>{{ unidadSeleccionada.proyecto }} - N° {{ unidadSeleccionada.numero_unidad }}</strong>
              <p>Precio: S/ {{ formatPrice(unidadSeleccionada.precio_venta) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- PARÁMETROS FINANCIEROS -->
      <div class="form-section">
        <h3 class="section-title">Parámetros Financieros</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="años">Plazo (años)</label>
            <input 
              id="años"
              type="number" 
              v-model="años" 
              required
              min="1"
              max="30"
              placeholder="Ej: 20"
            />
          </div>

          <div class="form-group">
            <label for="tasa">Tasa (%)</label>
            <input 
              id="tasa"
              type="number" 
              v-model="tasa" 
              required
              step="0.01"
              placeholder="Ej: 8.5"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="tipoTasa">Tipo de Tasa</label>
            <select id="tipoTasa" v-model="tipoTasa">
              <option value="Nominal">Nominal</option>
              <option value="Efectiva">Efectiva</option>
            </select>
          </div>

          <div class="form-group" v-if="tipoTasa === 'Nominal'">
            <label for="capitalizacion">Capitalización</label>
            <select id="capitalizacion" v-model="capitalizacion">
              <option value="Mensual">Mensual</option>
              <option value="Diaria">Diaria</option>
              <option value="30 días">30 días</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="gracia">Periodo de Gracia</label>
          <select id="gracia" v-model="gracia">
            <option value="Ninguno">Sin gracia</option>
            <option value="Total">Gracia Total (3 meses)</option>
            <option value="Parcial">Gracia Parcial (3 meses)</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="$router.back()" class="btn-cancel">
          Cancelar
        </button>
        <button type="submit" class="btn-submit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Generar Simulación
        </button>
      </div>
    </form>

    <div v-if="error" class="error-banner">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase"; 
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import UnidadSearchModal from "@/components/SimulationNewUnit.vue";

import { generarCronograma } from "@/utils/Finanzas";
import { guardarSimulacion, obtenerSimulacion, actualizarSimulacion } from "@/services/simulacionesService.js";

const nombreSimulacion = ref("");
const monto = ref("");
const años = ref("");
const tasa = ref("");
const tipoTasa = ref("Efectiva");
const capitalizacion = ref("Mensual");
const gracia = ref("Ninguno");
const error = ref("");

const dniBusqueda = ref("");
const clienteEncontrado = ref(null);
const errorBusquedaCliente = ref("");

const isUnidadModalOpen = ref(false);
const unidadSeleccionada = ref(null);

const isEditing = ref(false);
const editSimulacionId = ref(null); // Guardaremos el ID aquí
const isLoading = ref(false);

const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => isEditing.value ? 'Editar Simulación' : 'Nueva Simulación');
const submitButtonText = computed(() => isEditing.value ? 'Actualizar Simulación' : 'Generar Simulación');

onMounted(async () => {
  isLoading.value = true;
  const user = getAuth().currentUser;
  const editId = route.query.edit;

  if (editId) {
    isEditing.value = true;
    editSimulacionId.value = editId; // Guardamos el ID para usarlo al guardar
    const simData = await obtenerSimulacion(editId);
    if (simData && simData.parametros) {
      const params = simData.parametros;
      nombreSimulacion.value = params.nombre || '';
      monto.value = params.monto || '';
      años.value = params.años || '';
      tasa.value = params.tasa || '';
      tipoTasa.value = params.tipoTasa || 'Efectiva';
      capitalizacion.value = params.capitalizacion || 'Mensual';
      gracia.value = params.gracia || 'Ninguno';

      // Cargar datos del cliente
      if (params.clienteId) {
        const clientSnap = await getDoc(doc(db, "clients", params.clienteId));
        if (clientSnap.exists()) {
          clienteEncontrado.value = { id: clientSnap.id, ...clientSnap.data() };
        }
      }
      // Cargar datos de la unidad
      if (params.unidadId) {
        const unidadSnap = await getDoc(doc(db, "unidades", params.unidadId));
        if (unidadSnap.exists()) {
          unidadSeleccionada.value = { id: unidadSnap.id, ...unidadSnap.data() };
        }
      }
    }
  } else if (user) {
    // Cargar configuración por defecto solo si no estamos editando
    const refDoc = doc(db, "configuracion", user.uid);
    const snap = await getDoc(refDoc);
    if (snap.exists()) {
      const config = snap.data();
      if (config.tipoTasa) tipoTasa.value = config.tipoTasa;
      if (config.capitalizacion) capitalizacion.value = config.capitalizacion;
      if (config.plazoGracia) gracia.value = config.plazoGracia;
    }
  }
  isLoading.value = false;
});

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE').format(price);
}

function handleUnidadSeleccionada(unidad) {
  unidadSeleccionada.value = unidad;
  monto.value = unidad.precio_venta;
  isUnidadModalOpen.value = false;
}

async function buscarClientePorDni() {
  errorBusquedaCliente.value = "";
  clienteEncontrado.value = null;

  if (!/^\d{8}$/.test(dniBusqueda.value)) {
    errorBusquedaCliente.value = "El DNI debe tener 8 dígitos numéricos.";
    return;
  }

  const q = query(collection(db, "clients"), where("dni", "==", dniBusqueda.value), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    errorBusquedaCliente.value = "No se encontró ningún cliente con ese DNI.";
  } else {
    const doc = querySnapshot.docs[0];
    clienteEncontrado.value = { id: doc.id, ...doc.data() };
  }
}

async function crearSimulacion() {
  try {
    error.value = "";

    const user = getAuth().currentUser;
    if (!user) {
      error.value = "Debes iniciar sesión.";
      return;
    }

    if (!clienteEncontrado.value) {
      error.value = "Por favor, busca y selecciona un cliente válido antes de generar la simulación.";
      return;
    }

    if (!unidadSeleccionada.value) {
      error.value = "Por favor, busca y selecciona una unidad inmobiliaria.";
      return;
    }

    const resultado = generarCronograma({
      nombre: nombreSimulacion.value,
      monto: Number(monto.value),
      clienteId: clienteEncontrado.value.id,
      unidadId: unidadSeleccionada.value.id,
      años: Number(años.value),
      tasa: Number(tasa.value),
      tipoTasa: tipoTasa.value,
      capitalizacion: capitalizacion.value,
      gracia: gracia.value,
      mesesGracia: 3,
      seguroDesgravamen: 0.0005,
      seguroInmueble: 0.0003
    });

    if (isEditing.value) {
      // --- MODO EDICIÓN: Actualizamos el documento existente ---
      await actualizarSimulacion(editSimulacionId.value, resultado);
      router.push("/app/simulador/" + editSimulacionId.value); // Redirigimos al detalle
    } else {
      // --- MODO CREACIÓN: Creamos un nuevo documento ---
      const ref = await guardarSimulacion(resultado, user.uid);
      router.push("/app/simulador/" + ref.id);
    }
  } catch (e) {
    error.value = e.message;
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.simulation-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background-color: var(--color-card-background);
  border: 1.5px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  margin: 0 0 1.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-background);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s;
  color: var(--color-text-primary);
  background-color: white;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 111, 165, 0.1);
}

.form-group input::placeholder {
  color: #9CA3AF;
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.prefix {
  position: absolute;
  left: 1rem;
  color: var(--color-text-secondary);
  font-weight: 600;
  pointer-events: none;
}

.input-with-prefix input {
  padding-left: 2.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.search-container {
  display: flex;
  gap: 0.75rem;
}

.search-container input {
  flex: 1;
}

.btn-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-search:hover:not(:disabled) {
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
}

.btn-search:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-select-unit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background-color: white;
  color: var(--color-primary);
  border: 2px dashed var(--color-primary);
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-select-unit:hover {
  background-color: rgba(30, 111, 165, 0.05);
  border-style: solid;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.75rem;
}

.info-card svg {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.info-card strong {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
}

.info-card p {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.info-card.success {
  background-color: #ECFDF5;
  color: #065F46;
  border: 1.5px solid #A7F3D0;
}

.info-card.info {
  background-color: #EFF6FF;
  color: #1E40AF;
  border: 1.5px solid #BFDBFE;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: #FEE2E2;
  border-radius: 6px;
  border: 1.5px solid #FCA5A5;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background-color: #FEE2E2;
  color: var(--color-error);
  border: 1.5px solid #FCA5A5;
  border-radius: 8px;
  margin-top: 1.5rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1.5px solid #E5E7EB;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1.5px solid #D1D5DB;
  background-color: white;
  color: var(--color-text-primary);
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: var(--color-background);
  border-color: var(--color-text-secondary);
}

.btn-submit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(30, 111, 165, 0.2);
}

.btn-submit:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(30, 111, 165, 0.3);
}

.btn-submit:active,
.btn-cancel:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .container {
    padding: 1.5rem 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 1.25rem;
  }

  .search-container {
    flex-direction: column;
  }

  .btn-search {
    width: 100%;
    justify-content: center;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}
</style>