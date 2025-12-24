// 📂 src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔥 TU CONFIGURACIÓN DE FIREBASE (Recuperada de tu proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyAi4cmUvbgemxUbOd7tEIk4JDKM1PR77lA",
  authDomain: "nodoweb-7f090.firebaseapp.com",
  projectId: "nodoweb-7f090",
  storageBucket: "nodoweb-7f090.firebasestorage.app",
  messagingSenderId: "933742853300",
  appId: "1:933742853300:web:4a2fe9c2e07515b3062be1"
};

// 1. Inicializamos la aplicación
const app = initializeApp(firebaseConfig);

// 2. Exportamos la referencia a la base de datos (Firestore)
export const db = getFirestore(app);