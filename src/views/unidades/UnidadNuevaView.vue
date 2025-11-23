<template>
  <div>
    <h1>Nueva Unidad Inmobiliaria</h1>

    <form @submit.prevent="guardar">

      <label>Proyecto</label>
      <input v-model="form.proyecto" required />

      <label>Torre</label>
      <input v-model="form.torre" required />

      <label>Piso</label>
      <input v-model="form.piso" type="number" required />

      <label>Número</label>
      <input v-model="form.numero_unidad" required />

      <label>Área construida (m²)</label>
      <input v-model="form.area_construida" type="number" required />

      <label>Área ocupada (m²)</label>
      <input v-model="form.area_ocupada" type="number" required />

      <label>Precio venta (S/)</label>
      <input v-model="form.precio_venta" type="number" required />

      <label>Prima mínima (S/)</label>
      <input v-model="form.prima_minima" type="number" required />

      <label>Ubicación</label>
      <input v-model="form.ubicacion" required />

      <button type="submit">Guardar</button>
    </form>
  </div>
</template>

<script>
import { crearUnidad } from "@/services/unidadesService.js";

export default {
  data() {
    return {
      form: {
        proyecto: "",
        torre: "",
        piso: null,
        numero_unidad: "",
        area_construida: null,
        area_ocupada: null,
        precio_venta: null,
        prima_minima: null,
        ubicacion: "",
      },
    };
  },

  methods: {
    async guardar() {
      await crearUnidad(this.form);
      this.$router.push("/unidades");
    },
  },
};
</script>
