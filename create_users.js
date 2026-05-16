import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRKsMC_0MP27gf_lOv2XUp_SR9HNXHrxI",
  authDomain: "bajo-mundo-hub.firebaseapp.com",
  projectId: "bajo-mundo-hub",
  storageBucket: "bajo-mundo-hub.firebasestorage.app",
  messagingSenderId: "1004944715342",
  appId: "1:1004944715342:web:e832996d0845f1feb0dd1f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const fakeUsers = [
  {
    firstName: 'Olivia',
    lastName: 'Flow',
    bio: 'Artista urbana, rompiendo la tarima en cada bloque.',
    profilePic: '/img/perfil-1.png',
    email: 'olivia@bajomundo.com',
    followers: [],
    following: []
  },
  {
    firstName: 'Weso',
    lastName: 'Boss',
    bio: 'Buscando talentos y organizando los mejores partys.',
    profilePic: '/img/perfil-2.png',
    email: 'weso@bajomundo.com',
    followers: [],
    following: []
  },
  {
    firstName: 'Chucky',
    lastName: 'El Duro',
    bio: 'Siempre en la calle, nunca sapo.',
    profilePic: '/img/perfil-6.png',
    email: 'chucky@bajomundo.com',
    followers: [],
    following: []
  }
];

async function seed() {
  console.log("Iniciando creación de perfiles...");
  for (const u of fakeUsers) {
    try {
      // 1. Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, u.email, '123456');
      const uid = userCredential.user.uid;
      
      // 2. Guardar en Firestore con el UID correcto
      await setDoc(doc(db, 'users', uid), {
        firstName: u.firstName,
        lastName: u.lastName,
        bio: u.bio,
        profilePic: u.profilePic,
        email: u.email,
        followers: u.followers,
        following: u.following
      });
      console.log(`✅ Creado con éxito: ${u.firstName} (${u.email}) - UID: ${uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ El correo ${u.email} ya existe en Authentication.`);
      } else {
        console.error(`❌ Error con ${u.email}:`, error.message);
      }
    }
  }
  console.log("Proceso finalizado. Puedes probar los usuarios ahora.");
  process.exit(0);
}

seed();
