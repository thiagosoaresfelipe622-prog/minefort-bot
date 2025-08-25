import fetch from "node-fetch";

const SERVER_ID = "DsFuFUfi3Y";
const COOKIE = "cf_clearance=...; minefort-session=..."; // cole aqui
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ..."; // o mesmo do navegador

async function getStatus() {
  const res = await fetch("https://api.minefort.com/v1/user/servers", {
    headers: {
      "Cookie": COOKIE,
      "User-Agent": USER_AGENT,
      "Accept": "application/json"
    }
  });
  if (!res.ok) throw new Error("Erro ao pegar status");
  const data = await res.json();
  const server = data.find(s => s.id === SERVER_ID);
  return server?.status || "desconhecido";
}

async function startServer() {
  const res = await fetch(`https://api.minefort.com/v1/server/${SERVER_ID}/start`, {
    method: "POST",
    headers: {
      "Cookie": COOKIE,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json"
    }
  });
  console.log("Start status:", res.status);
}

async function loop() {
  try {
    const status = await getStatus();
    console.log("Status atual:", status);
    if (["hibernating", "offline"].includes(status)) {
      console.log("Servidor parado → tentando iniciar...");
      await startServer();
    }
  } catch (e) {
    console.error("Erro:", e.message);
  }
}

// roda a cada 60s
setInterval(loop, 60_000);
loop();
