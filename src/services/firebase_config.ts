import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBP4YHSd0y5fyU-VHCKG2mqRzZGH-Q9h8g",
  authDomain: "test-tarefas.firebaseapp.com",
  projectId: "test-tarefas",
  storageBucket: "test-tarefas.appspot.com",
  messagingSenderId: "640505343443",
  appId: "1:640505343443:web:27ba01e1c64484f6221326"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db }