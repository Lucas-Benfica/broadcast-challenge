# Broadcast Challenge - SaaS de Mensageria 🚀

Bem-vindo ao repositório do **Broadcast**, um sistema SaaS completo para gerenciamento de conexões, contatos e disparo agendado de mensagens.

🔗 **Acesse a aplicação em Produção:** [https://broadcast-challenge.web.app/](https://broadcast-challenge.web.app/)

---

## 💻 Sobre o Projeto

O objetivo deste projeto foi construir uma plataforma rápida com foco em segurança, performance e código limpo. Toda a arquitetura foi desenhada adotando uma abordagem **Multi-Tenant (SaaS)**, garantindo que os dados de cada cliente permaneçam 100% isolados utilizando regras robustas de segurança direto no servidor.

A interface visual foi projetada para ser limpa, "flat" e utilitária, combinando a agilidade do Tailwind CSS com a robustez dos componentes do Material UI.

## 🛠️ Tecnologias e Arquitetura

**Frontend:**
* **React + Vite:** Ambiente de desenvolvimento ágil e build ultra-otimizado, dispensando o antigo Create React App.
* **TypeScript:** Forte tipagem para prevenção de bugs e previsibilidade do ecossistema.
* **Tailwind CSS:** Design system e estilização sem overhead.
* **Material UI (MUI):** Utilizado de forma cirúrgica para componentes complexos (Modais com Backdrop, Selects múltiplos, DatePickers).
* **Paradigma Funcional:** O projeto dispensa Orientação a Objetos. Todo o estado e injeção de dependências é gerido por Custom Hooks puros e funções.

**Backend & Cloud (Firebase):**
* **Firebase Authentication:** Autenticação unificada e gerenciamento de sessões.
* **Cloud Firestore:** Banco de dados estruturado de forma **Plana (Flat)**. Ignoramos propositalmente o uso de subcoleções para permitir queries mais flexíveis e garantir escopo de exclusão.
* **Realtime Nativo:** As tabelas e cards no Front-end escutam o Firestore (`onSnapshot`). Qualquer alteração vinda de outras telas ou de robôs de background reflete na tela do usuário instantaneamente.
* **Cloud Functions (Cron Jobs):** Regras de negócios assíncronas isoladas em microserviços Node.js na nuvem.

## ⚡ Funcionalidades (O que você pode fazer no sistema)

O Broadcast foi desenhado para ser intuitivo. Assim que você entra na aplicação, esta é a jornada de possibilidades que você terá à disposição:

1. **Conta e Autenticação Segura:**
   * Crie uma conta rapidamente informando e-mail e senha. A partir desse momento, você ganha um "cofre" isolado onde ninguém mais terá acesso aos seus dados.

2. **Criação de Conexões:** 
   * As conexões são como pastas ou grupos organizacionais. Você pode criar, editar o nome ou apagar uma conexão.
   * *Atenção aos Bastidores:* Caso você decida apagar uma conexão que esteja cheia de contatos e mensagens, o sistema ativará uma "Exclusão em Cascata" via Backend, garantindo que todo o histórico seja deletado simultaneamente sem deixar rastros no banco.

3. **Gerenciamento de Contatos:**
   * Adicione contatos informando nome e telefone. Todo contato precisa ser vinculado a uma Conexão pai. 
   * Você pode buscar, editar ou excluir contatos livremente usando as tabelas interativas na tela.

4. **Agendamento e Envio Múltiplo de Mensagens:**
   * **Selecione Múltiplos Alvos:** Na hora de redigir a sua mensagem, um modal inteligente permite que você selecione dezenas de contatos da mesma conexão de uma só vez (via checkboxes).
   * **Envie Agora ou Depois:** Você pode optar por um disparo instantâneo ou utilizar nosso *DateTimePicker* para agendar uma data/hora no futuro.
   * **Motor de Background (O Robô Autônomo):** Se você agendar uma mensagem, pode até mesmo fechar o seu computador. Nós temos um robô na nuvem (Cloud Function) que roda ininterruptamente a cada minuto. Assim que der a hora exata, ele acorda, pega sua mensagem e dispara, mudando o status para `SENT`.
   * **Visualização em Tempo Real:** Se você deixar o site aberto, não precisa apertar F5. O painel das tabelas enxerga o robô alterando as mensagens no servidor e pisca as mudanças na tela ao vivo.

5. **Filtros Ágeis:**
   * Nas tabelas de mensagens, você pode navegar instantaneamente entre as abas "Todas", "Enviadas" e "Agendadas" para rastrear o histórico completo da sua operação.

## 🚀 Como rodar localmente

Se quiser rodar na sua máquina, siga os passos abaixo:

```bash
# Clone o projeto
git clone [seu-repositorio]
cd SendFlow-desafio

# Rode o Frontend
cd web
npm install
npm run dev

# (Opcional) Compile as funções backend
cd ../functions
npm install
npm run build
```

---