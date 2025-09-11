import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import type { User, Task, InsertTask, InsertUser } from "@shared/schema";

const firebaseConfig = {
  apiKey: "AIzaSyCRUbgSNA3xQM0YzS9qrQuRDusxnqsE3Zw",
  authDomain: "taskflow-37dc4.firebaseapp.com",
  projectId: "taskflow-37dc4",
  storageBucket: "taskflow-37dc4.firebasestorage.app",
  messagingSenderId: "208090367619",
  appId: "1:208090367619:web:c2f3180d31e979ce147db6",
  measurementId: "G-0JH819S721"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
};

export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logOut = () => {
  return signOut(auth);
};

export const handleAuthRedirect = () => {
  return getRedirectResult(auth);
};

// User functions
export const createUserProfile = async (user: InsertUser) => {
  const userRef = doc(db, "users", user.id);
  await setDoc(userRef, {
    ...user,
    createdAt: Timestamp.now(),
  });
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
    } as User;
  }
  
  return null;
};

// Task functions
export const createTask = async (task: InsertTask): Promise<string> => {
  const tasksRef = collection(db, "tasks");
  const docRef = await addDoc(tasksRef, {
    ...task,
    dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateTask = async (taskId: string, updates: Partial<InsertTask>) => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, {
    ...updates,
    dueDate: updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null,
    updatedAt: Timestamp.now(),
  });
};

export const deleteTask = async (taskId: string) => {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
};

export const getUserTasks = async (userId: string, filters?: { completed?: boolean }): Promise<Task[]> => {
  const tasksRef = collection(db, "tasks");
  let q = query(
    tasksRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  if (filters?.completed !== undefined) {
    q = query(
      tasksRef,
      where("userId", "==", userId),
      where("completed", "==", filters.completed),
      orderBy("createdAt", "desc")
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Task;
  });
};

export const getTodayTasks = async (userId: string): Promise<Task[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasksRef = collection(db, "tasks");
  const q = query(
    tasksRef,
    where("userId", "==", userId),
    where("dueDate", ">=", Timestamp.fromDate(today)),
    where("dueDate", "<", Timestamp.fromDate(tomorrow)),
    orderBy("dueDate", "asc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Task;
  });
};

export { onAuthStateChanged };
