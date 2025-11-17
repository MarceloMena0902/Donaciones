import axios from "axios";
import { auth, googleProvider, facebookProvider } from "../firebaseConfig";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const API_URL = "http://localhost:4000/api/auth";

// 🔹 Login con correo y contraseña
export const loginWithEmail = async (email: string, password: string) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCred.user.getIdToken();
  const response = await axios.post(`${API_URL}/verify`, { token });
  return response.data;
};

// 🔹 Login con Google
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const token = await result.user.getIdToken();
  const response = await axios.post(`${API_URL}/firebase`, {
    idToken: token,
    provider: "google",
  });
  return response.data;
};

// 🔹 Login con Facebook
export const loginWithFacebook = async () => {
  const result = await signInWithPopup(auth, facebookProvider);
  const token = await result.user.getIdToken();
  const response = await axios.post(`${API_URL}/firebase`, {
    idToken: token,
    provider: "facebook",
  });
  return response.data;
};
export const registerWithEmail = async (
  name: string,
  email: string,
  password: string,
  phone?: string,
  address?: string,
  photoUrl?: string
) => {
 
  const res = await axios.post("http://localhost:4000/api/auth/register", {
    name,
    email,
    password,
    phone: phone || "",
    address: address || "",
    photoUrl: photoUrl || "",  // ← CORRECTO
  });

  return res.data;
};
