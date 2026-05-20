import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export interface Contact {
  id: string;
  clientId: string;
  connectionId: string;
  name: string;
  phone: string;
}

export const useContacts = (clientId: string | undefined, connectionId?: string) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    let q = query(collection(db, "contacts"), where("clientId", "==", clientId));
    if (connectionId) {
      q = query(collection(db, "contacts"), where("clientId", "==", clientId), where("connectionId", "==", connectionId));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      
      setContacts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clientId, connectionId]);

  const addContact = async (data: Omit<Contact, 'id' | 'clientId'>) => {
    if (!clientId) return;
    await addDoc(collection(db, "contacts"), {
      clientId,
      ...data,
      createdAt: new Date().toISOString()
    });
  };

  const updateContact = async (id: string, data: Partial<Contact>) => {
    const ref = doc(db, "contacts", id);
    await updateDoc(ref, data);
  };

  const deleteContact = async (id: string) => {
    const ref = doc(db, "contacts", id);
    await deleteDoc(ref);
  };

  return { contacts, loading, addContact, updateContact, deleteContact };
};
