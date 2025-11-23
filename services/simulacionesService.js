import { db } from "@/firebase/index.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc 
} from "firebase/firestore";

const simulacionesCollection = collection(db, "simulaciones");

// ===============================
//  GUARDAR UNA SIMULACIÓN
// ===============================
export async function guardarSimulacion(simulacion, userId) {
  return await addDoc(simulacionesCollection, {
    ...simulacion,       // parametros + resultados + tabla
    userId,
    fecha: new Date()
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
