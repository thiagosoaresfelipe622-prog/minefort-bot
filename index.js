import fetch from "node-fetch";

// Variáveis de ambiente
const COOKIE = process.env.COOKIE;
const USER_AGENT = process.env.USER_AGENT;
const SERVER_ID = process.env.SERVER_ID;

// Função para esperar X milissegundos
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Pega status do servidor
async function getStatus(retryCount = 0) {
  try {
    const res = await fetch("https://api.minefort.com/v1/user/servers", {
      headers: {
        "Cookie": COOKIE,
        "User-Agent": USER_AGENT,
        "Accept": "application/json"
      }
    });

    if (res.status === 429) {
      const delay = Math.pow(2, retryCount) * 1000; // retry exponencial
      console.warn(`⚠️ Too Many Requests. Tentando de novo em ${delay/1000}s`);
      await wait(delay);
      return getStatus(retryCount + 1);
    }

    const data = await res.json();
    const server = data.find(s => s.id === SERVER_ID);
    return server?.status || "desconhecido";

  } catch (e) {
    console.error("Erro getStatus:", e.message);
    return "erro";
  }
}

// Liga o servidor
async function startServer() {
  try {
    const res = await fetch(`https://api.minefort.com/v1/server/${SERVER_ID}/start`, {
      method: "POST",
      headers: {
        "Cookie": COOKIE,
        "User-Agent": USER_AGENT,
        "Accept": "application/json"
      }
    });

    if(res.status === 429){
      console.warn("⚠️ Too Many Requests ao tentar start. Retentando...");
      await wait(5000);
      return startServer();
    }

    console.log("Servidor iniciado!");
  } catch (e) {
    console.error("Erro startServer:", e.message);
  }
}

// Loop principal
async function loop() {
  const status = await getStatus();
  console.log("Status atual:", status);

  if(status === "hibernating"){
    console.log("Servidor hibernando, ligando...");
    await startServer();
  } else if(status === "running") {
    console.log("Servidor já está rodando.");
  } else if(status === "erro") {
    console.log("Erro ao checar status. Tentando de novo no próximo loop.");
  }

  // Espera 5 minutos antes do próximo loop
  setTimeout(loop, 300000);
}

// Delay inicial de 10s antes do primeiro loop
setTimeout(loop, 10000);
