import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, writeBatch, getDocs } from "firebase/firestore";
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
    if (!clientId) return; // Segurança extra

    // Usando writeBatch para exclusão em cascata de forma atômica
    const batch = writeBatch(db);
    
    // 1. Referência da conexão
    const ref = doc(db, "connections", id);
    batch.delete(ref);

    // 2. Busca e deleta contatos da conexão (OBRIGATÓRIO TER O FILTRO DE clientId PARA A REGRA DE SEGURANÇA NÃO BLOQUEAR)
    const contactsQ = query(
      collection(db, "contacts"), 
      where("connectionId", "==", id),
      where("clientId", "==", clientId)
    );
    const contactsSnap = await getDocs(contactsQ);
    contactsSnap.docs.forEach(d => batch.delete(d.ref));

    // 3. Busca e deleta mensagens da conexão (OBRIGATÓRIO TER O FILTRO DE clientId PARA A REGRA DE SEGURANÇA NÃO BLOQUEAR)
    const messagesQ = query(
      collection(db, "messages"), 
      where("connectionId", "==", id),
      where("clientId", "==", clientId)
    );
    const messagesSnap = await getDocs(messagesQ);
    messagesSnap.docs.forEach(d => batch.delete(d.ref));

    // Comita tudo (Se falhar em 1, falha em todos. Se der certo, deleta tudo limpo)
    await batch.commit();
  };

  return {
    connections,
    loading,
    addConnection,
    updateConnection,
    deleteConnection
  };
};
