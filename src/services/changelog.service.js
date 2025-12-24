// 📂 src/services/changelog.service.js (CORREGIDO)

import { collection, getDocs, query, orderBy } from "firebase/firestore";
// 🔥 CORRECCIÓN CLAVE: El path ahora es "./firebase" porque están en la misma carpeta 'services'
import { db } from "./firebase.js"; 

const CHANGELOG_COLLECTION = "changelogs";

export const getChangelogs = async () => {
  try {
    // 1. Preparamos la consulta: Ordenar por fecha (más reciente arriba) [cite: 729]
    const q = query(
      collection(db, CHANGELOG_COLLECTION), 
      orderBy("date", "desc") // [cite: 729]
    );

    // 2. Hacemos la petición a Firebase [cite: 730]
    const snapshot = await getDocs(q);

    // 3. Limpiamos los datos para usarlos fácil en React [cite: 731]
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Transformamos el Timestamp raro de Firebase a una fecha normal de JS [cite: 731]
      date: doc.data().date?.toDate() 
    }));

    return { success: true, data: data }; // [cite: 732]

  } catch (error) {
    console.error("Error fetching changelogs:", error); // [cite: 733]
    return { success: false, data: [], message: error.message }; // [cite: 733]
  }
};