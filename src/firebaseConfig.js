import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyAaxBxClGHAVHAMZXzZFwR10QLuVubesVU",
  authDomain: "bhindi-82dec.firebaseapp.com",
  projectId: "bhindi-82dec",
  storageBucket: "bhindi-82dec.appspot.com",
  messagingSenderId: "763195742769",
  appId: "1:763195742769:web:8bde9a8c4626e6f0e25310",
  measurementId: "G-RMNSW7C04M",
});

const fs = firebaseApp.firestore();
const itemsRef = fs.collection("items");

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const res = await auth.signInWithPopup(googleProvider);
    console.log(res.user);
  } catch (error) {
    console.error(error);
  }
};

const signOut = async () => {
  try {
    const res = await auth.signOut();
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

export { fs, itemsRef, auth, signInWithGoogle, signOut };
