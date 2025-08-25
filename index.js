import fetch from "node-fetch";

// Pegando valores das variáveis de ambiente
const SERVER_ID = process.env.SERVER_ID;
const COOKIE = process.env.COOKIE;
const USER_AGENT = process.env.USER_AGENT;

if (!SERVER_ID || !COOKIE || !USER_AGENT) {
  console.error("⚠️ Por favor, configure as variáveis de ambiente: SERVER_ID, COOKIE, USER_AGENT");
  process.exit(1);
}

async function getStatus() {
  try {
    const res = await fetch("https://api.minefort.com/v1/user/servers", {
      headers: {
        "Cookie": COOKIE,
        "User-Agent": USER_AGENT,
        "Accept": "application/json"
      }
    });
    if (!res.ok) throw new Error(`Erro ao pegar status: ${res.status}`);
    const data = await res.json();
    const server = data.find(s => s.id === SERVER_ID);
    return server?.status || "desconhecido";
  } catch (e) {
    console.error("Erro getStatus:", e.message);
    return "erro";
  }
}

async function startServer() {
  try {
    const res = await fetch(`https://api.minefort.com/v1/server/${SERVER_ID}/start`, {
      method: "POST",
      headers: {
        "Cookie": COOKIE,
        "User-Agent": USER_AGENT,
        "Content-Type": "application/json"
      }
    });
    console.log("Start request status:", res.status);
  } catch (e) {
    console.error("Erro startServer:", e.message);
  }
}

async function loop() {
  const status = await getStatus();
  console.log("Status atual:", status);
  if (["hibernating", "offline"].includes(status)) {
    console.log("Servidor parado → tentando iniciar...");
    await startServer();
  }
}

// Roda a cada 5m
setInterval(loop, 300000);
loop();

