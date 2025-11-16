import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config.js'; 

const app = initializeApp(firebaseConfig);
 
export const auth = getAuth(app); //autenticación
export const db = getFirestore(app); //base de datos Firestore
