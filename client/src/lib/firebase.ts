import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import type { User, Task, InsertTask, InsertUser } from "@shared/schema";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCRUbgSNA3xQM0YzS9qrQuRDusxnqsE3Zw",
  authDomain: "taskflow-37dc4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "taskflow-37dc4",
  storageBucket: "taskflow-37dc4.firebasestorage.app",
  messagingSenderId: "208090367619",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:208090367619:web:c2f3180d31e979ce147db6",
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
  
  // Build the update object conditionally to avoid overwriting dueDate
  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now(),
  };
  
  // Only update dueDate if it's explicitly provided in updates
  if ('dueDate' in updates) {
    updateData.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null;
  }
  
  await updateDoc(taskRef, updateData);
};

export const deleteTask = async (taskId: string) => {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
};

export interface TaskFilters {
  completed?: boolean;
  category?: string;
  priority?: string;
  dueDate?: 'today' | 'tomorrow' | 'thisWeek' | 'overdue';
  searchTerm?: string;
}

export const getUserTasks = async (userId: string, filters?: TaskFilters): Promise<Task[]> => {
  const tasksRef = collection(db, "tasks");
  
  try {
    // Use the simplest possible query to avoid any index requirements
    const q = query(tasksRef, where("userId", "==", userId));
    
    console.log("Executing Firebase query for user:", userId);
    const querySnapshot = await getDocs(q);
    console.log("Firebase query returned", querySnapshot.docs.length, "documents");
    
    let results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Task;
    });

    // Sort client-side by creation date (newest first)
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log("Tasks before filtering:", results.map(t => ({ id: t.id, title: t.title })));

    // Apply all filters client-side
    if (filters) {
      const originalLength = results.length;
      
      results = results.filter(task => {
        // Completion status filter
        if (filters.completed !== undefined && task.completed !== filters.completed) {
          return false;
        }
        
        // Category filter
        if (filters.category && task.category !== filters.category) {
          return false;
        }
        
        // Priority filter
        if (filters.priority && task.priority !== filters.priority) {
          return false;
        }
        
        // Date filter
        if (filters.dueDate) {
          const now = new Date();
          const taskDueDate = task.dueDate;
          
          switch (filters.dueDate) {
            case 'today':
              if (!taskDueDate) return false;
              const today = new Date(now);
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              if (taskDueDate < today || taskDueDate >= tomorrow) return false;
              break;
              
            case 'tomorrow':
              if (!taskDueDate) return false;
              const tomorrowStart = new Date(now);
              tomorrowStart.setDate(tomorrowStart.getDate() + 1);
              tomorrowStart.setHours(0, 0, 0, 0);
              const tomorrowEnd = new Date(tomorrowStart);
              tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
              if (taskDueDate < tomorrowStart || taskDueDate >= tomorrowEnd) return false;
              break;
              
            case 'thisWeek':
              if (!taskDueDate) return false;
              const weekStart = new Date(now);
              weekStart.setDate(weekStart.getDate() - weekStart.getDay());
              weekStart.setHours(0, 0, 0, 0);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 7);
              if (taskDueDate < weekStart || taskDueDate >= weekEnd) return false;
              break;
              
            case 'overdue':
              if (!taskDueDate || task.completed) return false;
              const nowStart = new Date(now);
              nowStart.setHours(0, 0, 0, 0);
              if (taskDueDate >= nowStart) return false;
              break;
          }
        }
        
        // Search term filter (full-text search)
        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
          const titleMatch = task.title.toLowerCase().includes(searchTerm);
          const descriptionMatch = task.description && task.description.toLowerCase().includes(searchTerm);
          if (!titleMatch && !descriptionMatch) return false;
        }
        
        return true;
      });

      console.log(`Applied filters: ${originalLength} -> ${results.length} tasks`);
      console.log("Active filters:", filters);
    }

    console.log("Final results:", results.map(t => ({ id: t.id, title: t.title })));
    return results;
    
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const getTodayTasks = async (userId: string): Promise<Task[]> => {
  try {
    // Get all user tasks and filter client-side to avoid index requirements
    const allTasks = await getUserTasks(userId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter for today's tasks client-side
    const todayTasks = allTasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate >= today && task.dueDate < tomorrow;
    });

    // Sort by due date ascending
    todayTasks.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

    return todayTasks;
  } catch (error) {
    console.error("Error fetching today's tasks:", error);
    throw error;
  }
};

export { onAuthStateChanged };
