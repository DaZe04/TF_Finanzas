import { db } from "../firebase/index.js";
import { collection, addDoc, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";

const unidadesCollection = collection(db,"unidades");

//obetener todas las unidades
export const getUnidades=async ()=>{
    const snapshot=await getDocs(unidadesCollection);
    return snapshot.docs.map((d)=>({id: d.id, ...d.data()}))
};

//crear nueva unidad
export const crearUnidad=async(unidad)=>{
    return await addDoc(unidadesCollection, {...unidad, fecha_creacion: new Date()});

};

//Actualizar unidad
export const actualizarUnidad=async(id,data)=>{
    const ref=doc(db,"unidades",id);
    return await updateDoc(ref,data);
};
