<template>
  <div class="home-admin">
    <h2>Panel Client</h2>

    <button @click="logout" class="logout-btn">
      Cerrar sesión
    </button>
  </div>
</template>

<script>
import { getAuth, signOut } from "firebase/auth";

export default {
  name: "HomeAgentSection",
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

    return { logout };
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
.logout-btn:hover {
  background: #ff2d2d;
}
</style>
