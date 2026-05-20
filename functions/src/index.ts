import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

// Inicializa o Admin SDK. Ignora regras de segurança para a função acessar o Firestore
admin.initializeApp();

const db = admin.firestore();

/**
 * Função Agendada: processScheduledMessages
 * Roda a cada 1 minuto nos servidores do Google.
 */
export const processScheduledMessages = onSchedule("every 1 minutes", async (event) => {
  try {
    // Pega o exato milissegundo de agora no formato "2026-05-20T15:30:00.000Z"
    const now = new Date().toISOString();

    // Passo 1: Consultar o Banco de Dados
    // Vai na coleção "messages", procura quem está com status de agendado (SCHEDULED) 
    // E onde a data agendada (scheduledAt) é menor ou igual ao exato momento de agora
    const messagesRef = db.collection("messages");
    const snapshot = await messagesRef
      .where("status", "==", "SCHEDULED")
      .where("scheduledAt", "<=", now)
      .get();

    // Se não tiver nenhuma, simplesmente encerra a função e volta a dormir
    if (snapshot.empty) {
      console.log("Nenhuma mensagem agendada pendente para envio.");
      return;
    }

    console.log(`Encontradas ${snapshot.size} mensagens atrasadas ou prontas para envio.`);

    // Passo 2: Preparar o Lote (Batch)
    // O batch permite agrupar todas as edições em um único pacote
    const batch = db.batch();

    // Passo 3: O Loop de Envio
    snapshot.docs.forEach((doc) => {
      // Aqui faria a chamada para a api de mensagem

      // SIMULAÇÃO
      // Pega a referência do documento atual e manda atualizar o status
      batch.update(doc.ref, {
        status: "SENT",
        sentAt: now // Guardar a hora do envio
      });
    });

    // Passo 4: Confirmar a edição no banco
    // Esse comando é quem de fato escreve "SENT" lá no Firestore. O Front-end do usuário piscará no mesmo segundo.
    await batch.commit();

    console.log("Todas as mensagens pendentes foram processadas com sucesso!");

  } catch (error) {
    console.error("Erro ao processar as mensagens agendadas:", error);
  }
});
