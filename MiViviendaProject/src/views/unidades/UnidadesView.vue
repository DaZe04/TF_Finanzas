<template>
  <div class="container">
    <h1>Unidades Inmobiliarias</h1>

    <button @click="$router.push('/unidades/nueva')">Nueva Unidad</button>

    <table>
      <thead>
        <tr>
          <th>Proyecto</th>
          <th>Número</th>
          <th>Área construida</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in unidades" :key="u.id">
          <td>{{ u.proyecto }}</td>
          <td>{{ u.numero_unidad }}</td>
          <td>{{ u.area_construida }} m²</td>
          <td>S/ {{ u.precio_venta }}</td>
          <td>
            <button @click="$router.push(`/unidades/${u.id}/editar`)">
              Editar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { getUnidades } from "@/services/unidadesService.js";

export default {
  data() {
    return {
      unidades: [],
    };
  },

  async mounted() {
    this.unidades = await getUnidades();
  },
};
</script>
