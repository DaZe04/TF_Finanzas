# MiViviendaProject

Este proyecto es una aplicación web para la gestión de un fondo de vivienda, desarrollada con Vue.js y Firebase. Permite la autenticación de usuarios con diferentes roles (Administrador y Agente) y muestra vistas personalizadas según el rol del usuario.

## Características Principales

*   **Autenticación de Usuarios:** Registro, inicio de sesión y recuperación de contraseña.
*   **Base de Datos en Tiempo Real:** Uso de Firestore para almacenar información de los usuarios.
*   **Vistas por Roles:** Contenido dinámico para administradores y agentes.
*   **Diseño Responsivo:** Interfaz adaptable a diferentes tamaños de pantalla.
*   **Colores Globales:** Los colores se encuentran están en `src/assets/styles/colors.css`.

## Tecnologías Utilizadas

*   **Vue.js 3:** Framework progresivo de JavaScript para construir interfaces de usuario. Se utiliza la sintaxis `<script setup>` (Composition API).
*   **Vue Router:** Para la gestión de las rutas y la navegación en la aplicación.
*   **Firebase:**
    *   **Firebase Authentication:** Para manejar el registro, inicio de sesión y recuperación de contraseñas.
    *   **Firestore:** Como base de datos NoSQL para almacenar datos adicionales de los usuarios, como su rol, nombre completo, etc.

## Primeros Pasos

Sigue estas instrucciones para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

*   Node.js (versión 18 o superior recomendada).
*   npm (generalmente se instala con Node.js).


### Instalación y Configuración

1.  **Clonar el repositorio**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd MiViviendaProject
    ```

2.  **Instalar dependencias**
    Este comando leerá el archivo `package.json` e instalará todas las librerías necesarias para que el proyecto funcione.
    ```bash
    npm install
    ```

3.  **Configurar Firebase (ya hecho)**
    El proyecto se conecta a Firebase a través de un archivo de configuración. Este archivo está en `src/firebase/index.js`y ya tiene
    las credenciales del proyecto.

    ```javascript
    // src/firebase/index.js
    import { initializeApp } from 'firebase/app';
    import { getAuth } from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore';

    const firebaseConfig = {
      apiKey: "TU_API_KEY",
      authDomain: "TU_AUTH_DOMAIN",
      projectId: "TU_PROJECT_ID",
      storageBucket: "TU_STORAGE_BUCKET",
      messagingSenderId: "TU_MESSAGING_SENDER_ID",
      appId: "TU_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app); // Módulo de autenticación
    const db = getFirestore(app); // Módulo de base de datos Firestore

    export { auth, db };
    ```

4.  **Ejecutar el proyecto localmente**
    Este comando inicia un servidor de desarrollo local, generalmente en `http://localhost:5173`. La aplicación se recargará automáticamente cada vez que hagas cambios en el código.
    ```bash
    npm run dev
    ```

## Conceptos Clave del Proyecto

### Autenticación (`auth`)

La autenticación se gestiona con **Firebase Authentication**. El objeto `auth` que se exporta desde `src/firebase/index.js` es la puerta de entrada a todas las funciones de autenticación:

*   `createUserWithEmailAndPassword`: Se usa en `RegisterView.vue` para crear un nuevo usuario.
*   `signInWithEmailAndPassword`: Se usa en la vista de Login para iniciar sesión.
*   `sendPasswordResetEmail`: Se usa en `ForgotPassword.vue` para enviar un correo de recuperación.

Cuando un usuario se registra, además de crear la cuenta en Firebase Authentication, se crea un documento en la colección `users` de **Firestore** usando el `uid` del usuario como identificador. Este documento guarda información adicional como el nombre, DNI y el tipo de cuenta.

### Rutas y Navegación

El enrutamiento se maneja con **Vue Router**. Las rutas principales se definen en la configuración del router (`src/router/index.js`).

*   **Rutas Públicas:** `/login`, `/register`, `/forgot-password` son accesibles para cualquier visitante.
*   **Rutas Protegidas:** La ruta principal (`/` o `/home`) está protegida y solo es accesible para usuarios autenticados.

El componente `Home.vue` es un ejemplo de enrutamiento en Vue:
1.  Verifica si hay un usuario autenticado (no se puede entrar a la vista sin logearse).
2.  Obtiene el documento del usuario desde Firestore usando su `uid`.
3.  Lee el campo `accountType` (`administrador` o `agente`).
4.  Renderiza condicionalmente el componente correspondiente (`HomeAdminSection` o `HomeAgentSection`).

Esto permite mostrar una interfaz completamente diferente para cada tipo de rol sin necesidad de crear rutas separadas para cada uno.


### Usuarios creados

Si es posible trabajen únicamente con los usuarios creados que les pasaré ahora, pero si desean trabajar con uno nuevo, no pasa nada.

#### Usuario (Admin)

- Nombre: Admin
- Correo: admin@correo.com
- DNI: 12345678
- Teléfono: 123456789
- Contraseña: 123456
- Tipo de cuenta: Administrador

#### Usuario (Agente)

- Nombre: Agent
- Correo: agent@correo.com
- DNI: 87654321
- Teléfono: 987654321
- Contraseña: 654321
- Tipo de cuenta: Agente

### Usar Correo y Contraseña para ingresar en la vista del Login




