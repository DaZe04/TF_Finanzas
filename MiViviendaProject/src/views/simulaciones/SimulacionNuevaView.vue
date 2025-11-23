<template>
  <div class="container">
    <h1>Nueva Simulación</h1>

    <form @submit.prevent="crearSimulacion">

      <!-- MONTO -->
      <label>Monto del Crédito</label>
      <input type="number" v-model="monto" required />

      <!-- AÑOS -->
      <label>Años del préstamo</label>
      <input type="number" v-model="años" required />

      <!-- TIPO DE TASA -->
      <label>Tipo de Tasa</label>
      <select v-model="tipoTasa">
        <option value="Nominal">Nominal</option>
        <option value="Efectiva">Efectiva</option>
      </select>

      <!-- TASA -->
      <label>Tasa (%)</label>
      <input type="number" v-model="tasa" required />

      <!-- CAPITALIZACIÓN (solo si nominal) -->
      <label v-if="tipoTasa === 'Nominal'">Capitalización</label>
      <select v-if="tipoTasa === 'Nominal'" v-model="capitalizacion">
        <option value="Mensual">Mensual</option>
        <option value="Diaria">Diaria</option>
        <option value="30 días">30 días</option>
      </select>

      <!-- GRACIA -->
      <label>Periodo de gracia</label>
      <select v-model="gracia">
        <option value="Ninguno">Ninguno</option>
        <option value="Total">Gracia Total (3 meses)</option>
        <option value="Parcial">Gracia Parcial (3 meses)</option>
      </select>

      <button type="submit">Generar Simulación</button>
    </form>

    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getAuth } from "firebase/auth";

import { generarCronograma } from "@/utils/Finanzas.js";
import { guardarSimulacion } from "@/services/simulacionesService.js";

// Campos del formulario
const monto = ref("");
const años = ref("");
const tasa = ref("");
const tipoTasa = ref("Efectiva");
const capitalizacion = ref("Mensual");
const gracia = ref("Ninguno");
const error = ref("");

const router = useRouter();

async function crearSimulacion() {
  try {
    error.value = "";

    const user = getAuth().currentUser;
    if (!user) {
      error.value = "Debes iniciar sesión.";
      return;
    }

    // Generación financiera completa
    const resultado = generarCronograma({
      monto: Number(monto.value),
      años: Number(años.value),
      tasa: Number(tasa.value),
      tipoTasa: tipoTasa.value,
      capitalizacion: capitalizacion.value,
      gracia: gracia.value,
      mesesGracia: 3,               // configurable
      seguroDesgravamen: 0.0005,    // 0.05% mensual
      seguroInmueble: 0.0003        // opcional
    });

    const ref = await guardarSimulacion(resultado, user.uid);

    router.push("/simulaciones/" + ref.id);
  } catch (e) {
    error.value = e.message;
  }
}
</script>

<style>
.container {
  max-width: 500px;
  margin: auto;
  padding: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input, select {
  padding: 8px;
  font-size: 16px;
}
</style>
