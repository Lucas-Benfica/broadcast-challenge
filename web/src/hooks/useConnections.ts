import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export interface Connection {
  id: string;
  clientId: string;
  name: string;
  contactsCount: number;
  messagesCount: number;
}

export const useConnections = (clientId: string | undefined) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "connections"), where("clientId", "==", clientId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        contactsCount: doc.data().contactsCount || 0,
        messagesCount: doc.data().messagesCount || 0
      })) as Connection[];

      setConnections(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clientId]);

  const addConnection = async (name: string) => {
    if (!clientId) return;
    await addDoc(collection(db, "connections"), {
      clientId,
      name,
      contactsCount: 0,
      messagesCount: 0,
      createdAt: new Date().toISOString()
    });
  };

  const updateConnection = async (id: string, name: string) => {
    const ref = doc(db, "connections", id);
    await updateDoc(ref, { name });
  };

  const deleteConnection = async (id: string) => {
    const ref = doc(db, "connections", id);
    await deleteDoc(ref);
  };

  return {
    connections,
    loading,
    addConnection,
    updateConnection,
    deleteConnection
  };
};
