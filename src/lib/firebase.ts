import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Аналітика необов'язкова: у приватному режимі чи з блокувальником вона недоступна,
// і це не повинно ламати сайт.
import('firebase/analytics')
  .then(async ({ getAnalytics, isSupported }) => {
    if (await isSupported()) getAnalytics(app);
  })
  .catch(() => {});

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => (await signInWithPopup(auth, googleProvider)).user;
export const logOut = () => signOut(auth);

/** ID-токен поточного користувача для заголовка Authorization. */
export const getIdToken = async (): Promise<string | null> =>
  auth.currentUser ? auth.currentUser.getIdToken() : null;
