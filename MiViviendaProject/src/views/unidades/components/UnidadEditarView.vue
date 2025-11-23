<template>
  <div>
    <h1>Editar Unidad</h1>

    <form @submit.prevent="guardar">

      <label>Proyecto</label>
      <input v-model="form.proyecto" />

      <label>Torre</label>
      <input v-model="form.torre" />

      <label>Piso</label>
      <input v-model="form.piso" type="number" />

      <label>Número</label>
      <input v-model="form.numero_unidad" />

      <label>Área construida (m²)</label>
      <input v-model="form.area_construida" type="number" />

      <label>Área ocupada (m²)</label>
      <input v-model="form.area_ocupada" type="number" />

      <label>Precio venta (S/)</label>
      <input v-model="form.precio_venta" type="number" />

      <label>Prima mínima (S/)</label>
      <input v-model="form.prima_minima" type="number" />

      <label>Ubicación</label>
      <input v-model="form.ubicacion" />

      <button type="submit">Guardar cambios</button>
    </form>
  </div>
</template>

<script>
import { getUnidad, actualizarUnidad } from "@/services/unidadesService.js";

export default {
  props: ["id"],

  data() {
    return {
      form: {},
    };
  },

  async mounted() {
    this.form = await getUnidad(this.id);
  },

  methods: {
    async guardar() {
      await actualizarUnidad(this.id, this.form);
      this.$router.push("/unidades");
    },
  },
};
</script>
 
