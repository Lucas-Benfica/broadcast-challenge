import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export interface Message {
  id: string;
  clientId: string;
  connectionId: string;
  contactIds: string[];
  content: string;
  status: 'SENT' | 'SCHEDULED';
  scheduledAt: string;
  createdAt: string;
}

export const useMessages = (clientId: string | undefined, connectionId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    let q = query(collection(db, "messages"), where("clientId", "==", clientId));
    if (connectionId) {
      q = query(collection(db, "messages"), where("clientId", "==", clientId), where("connectionId", "==", connectionId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];

      // Ordenar as mensagens localmente pela data mais recente
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clientId, connectionId]);

  const addMessage = async (data: Omit<Message, 'id' | 'clientId' | 'createdAt'>) => {
    if (!clientId) return;
    await addDoc(collection(db, "messages"), {
      clientId,
      ...data,
      createdAt: new Date().toISOString()
    });
  };

  const updateMessage = async (id: string, data: Partial<Message>) => {
    const ref = doc(db, "messages", id);
    await updateDoc(ref, data);
  };

  const deleteMessage = async (id: string) => {
    const ref = doc(db, "messages", id);
    await deleteDoc(ref);
  };

  return { messages, loading, addMessage, updateMessage, deleteMessage };
};
