import puppeteer from 'puppeteer';

const EMAIL = process.env.MF_EMAIL;
const PASSWORD = process.env.MF_PASSWORD;
const SERVER_ID = process.env.SERVER_ID;

async function startServer() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Configura User-Agent
  await page.setUserAgent(process.env.USER_AGENT || 'Mozilla/5.0');

  // Vai para a página de login
  await page.goto('https://minefort.com/login', { waitUntil: 'networkidle2' });

  // Preenche login
  await page.type('input[name="email"]', EMAIL);
  await page.type('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');

  // Espera página carregar totalmente
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Vai para a página do servidor
  await page.goto(`https://minefort.com/dashboard/${SERVER_ID}`, { waitUntil: 'networkidle2' });

  // Checa status
  const status = await page.$eval('.server-status', el => el.innerText.toLowerCase());
  console.log('Status atual:', status);

  if(status.includes('hibernating')){
    console.log('Servidor hibernando, iniciando...');
    await page.click('.start-server-button');
    console.log('Servidor iniciado!');
  } else {
    console.log('Servidor não precisa iniciar.');
  }

  await browser.close();
}

// Loop a cada 5 minutos
setInterval(startServer, 300000);
