// Script one-shot para actualizar la bitácora en Firebase
// Corre con: node server/update-changelog.mjs
// (requiere las mismas credenciales Firebase del proyecto)

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAi4cmUvbgemxUbOd7tEIk4JDKM1PR77lA",
  authDomain: "nodoweb-7f090.firebaseapp.com",
  projectId: "nodoweb-7f090",
  storageBucket: "nodoweb-7f090.firebasestorage.app",
  messagingSenderId: "933742853300",
  appId: "1:933742853300:web:4a2fe9c2e07515b3062be1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const col = collection(db, "changelogs");

// ── 1. Borrar entrada "Sistema de Votación" ──────────────────────────
const snapshot = await getDocs(col);
let deleted = 0;
for (const docSnap of snapshot.docs) {
  const data = docSnap.data();
  if (data.title && data.title.toLowerCase().includes("votaci")) {
    await deleteDoc(doc(db, "changelogs", docSnap.id));
    console.log(`🗑️  Borrado: "${data.title}" (id: ${docSnap.id})`);
    deleted++;
  }
}
if (deleted === 0) console.log("ℹ️  No se encontró entrada de votación (puede que ya esté borrada).");

// ── 2. Agregar entradas nuevas ───────────────────────────────────────
const newEntries = [
  {
    title: "Server 24/7 activado",
    description: "El servidor Nodo Persistente ahora corre en infraestructura dedicada con uptime garantizado. Ya no depende de una máquina local — el nodo está siempre disponible en nodo-persistente.baires.cloud.",
    type: "new",
    version: "Fabric 26.2",
    date: Timestamp.fromDate(new Date("2026-08-03")),
  },
  {
    title: "Rediseño visual de la sección Minecraft",
    description: "Renovación completa del diseño de la página: nuevo ServerStatus siempre online, panel de mods actualizado con categorías Esenciales/Visuales, tarjeta de landing con badge SERVER 24/7, y correcciones de user-select en elementos interactivos.",
    type: "update",
    version: "v2.1",
    date: Timestamp.fromDate(new Date("2026-08-03")),
  },
  {
    title: "Actualización a Fabric 26.2",
    description: "El servidor migró de Fabric 1.21.10 a Fabric 26.2. Pack de mods actualizado: se incorporaron FerriteCore, EntityCulling y ModernFix. En el lado del cliente se recomienda Iris + Complementary Shaders para la experiencia visual completa.",
    type: "update",
    version: "Fabric 26.2",
    date: Timestamp.fromDate(new Date("2026-08-03")),
  },
];

for (const entry of newEntries) {
  const ref = await addDoc(col, entry);
  console.log(`✅ Agregado: "${entry.title}" (id: ${ref.id})`);
}

console.log("\n🎉 Bitácora actualizada correctamente.");
process.exit(0);
