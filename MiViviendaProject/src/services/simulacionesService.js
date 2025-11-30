import { db } from "@/firebase/index.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc,
  updateDoc
} from "firebase/firestore";

const simulacionesCollection = collection(db, "simulaciones");

// ===============================
//  GUARDAR UNA SIMULACIÓN
// ===============================
export async function guardarSimulacion(simulacion, userId) {
  return await addDoc(simulacionesCollection, {
    ...simulacion,       // parametros + resultados + tabla
    userId,
    fechaCreacion: new Date() // Cambiamos 'fecha' por 'fechaCreacion'
  });
}

// ===============================
//  ACTUALIZAR UNA SIMULACIÓN
// ===============================
export async function actualizarSimulacion(id, simulacion) {
  const docRef = doc(db, "simulaciones", id);
  return await updateDoc(docRef, {
    ...simulacion,
    fechaModificacion: new Date() // Añadimos una fecha de modificación
  });
}

// ===============================
//  OBTENER TODAS LAS SIMULACIONES DEL USUARIO
// ===============================
export async function obtenerSimulacionesUsuario(userId) {
  const snapshot = await getDocs(simulacionesCollection);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((sim) => sim.userId === userId);
}

// ===============================
//  OBTENER UNA SIMULACIÓN POR ID
// ===============================
export async function obtenerSimulacion(id) {
  const ref = doc(db, "simulaciones", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  return { id, ...snap.data() };
}

export const obtenerSimulacionesGlobal = async () => {
  const colRef = collection(db, "simulaciones");
  const snap = await getDocs(colRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ===============================
//  OBTENER UN CLIENTE POR ID
// ===============================
export async function getClientById(id) {
  const ref = doc(db, "clients", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id, ...snap.data() };
}

// ===============================
//  OBTENER UNA UNIDAD POR ID
// ===============================
export async function getUnidadById(id) {
  const ref = doc(db, "unidades", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id, ...snap.data() };
}
