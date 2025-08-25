import puppeteer from "puppeteer";

// Variáveis de ambiente
const EMAIL = process.env.MF_EMAIL;
const PASSWORD = process.env.MF_PASSWORD;
const SERVER_ID = process.env.SERVER_ID;
const USER_AGENT = process.env.USER_AGENT || "Mozilla/5.0";

async function startServer() {
  try {
    console.log("Iniciando bot Minefort...");

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);

    console.log("Abrindo página de login...");
    await page.goto("https://minefort.com/login", { waitUntil: "networkidle2" });

    // Preenche login
    await page.type('input[name="email"]', EMAIL);
    await page.type('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("Login concluído.");

    // Vai para página do servidor
    await page.goto(`https://minefort.com/dashboard/${SERVER_ID}`, { waitUntil: "networkidle2" });

    // Checa status
    const status = await page.$eval(".server-status", el => el.innerText.toLowerCase());
    console.log("Status atual:", status);

    if (status.includes("hibernating")) {
      console.log("Servidor hibernando, iniciando...");
      await page.click(".start-server-button");
      console.log("Servidor iniciado!");
    } else {
      console.log("Servidor não precisa iniciar.");
    }

    await browser.close();
  } catch (err) {
    console.error("Erro no bot:", err);
  }
}

// Loop a cada 5 minutos
setInterval(startServer, 300000);

// Delay inicial de 10 segundos
setTimeout(startServer, 10000);
