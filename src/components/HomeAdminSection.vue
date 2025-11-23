<template>
  <div class="home-admin">
    <h2>Panel Admin</h2>

     <button @click="goToConfig" class="config-btn">
      ⚙️ Configuración
    </button>

    <button @click="logout" class="logout-btn">
      Cerrar sesión
    </button>
  </div>
</template>

<script>
import { getAuth, signOut } from "firebase/auth";

export default {
  name: "HomeAdminSection",
  setup() {
    const auth = getAuth();

    const logout = async () => {
      try {
        await signOut(auth);
        console.log("Sesión cerrada");

        // Redirige al login
        window.location.href = "/login";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };

    // rEDIRIGE a configuración
    const goToConfig = () => {
      window.location.href = "/configuracion";
    };
    return { logout, goToConfig  };
  }
};
</script>

<style scoped>
.logout-btn {
  background: #ff5252;
  border: none;
  padding: 10px 18px;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.config-btn:hover {
  background: #005fcc;
}

.logout-btn:hover {
  background: #ff2d2d;
}
</style>
