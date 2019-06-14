const express = require('express');
const next = require('next');
const puppeteer = require('puppeteer');
const cacheableResponse = require('cacheable-response');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const torrentCache = cacheableResponse({
  ttl: 1000 * 60 * 60 * 24, // 24hour
  get: async ({ req, res, link }) => ({
    data: await getTorrent(link)
  }),
  send: ({ data, res }) => res.send(data)
});

const searchCache = cacheableResponse({
  ttl: 1000 * 60 * 60, // 1hour
  get: async ({ req, res, site, search }) => ({
    data: await getSearchResults(site, search)
  }),
  send: ({ data, res }) => res.send(data)
});

async function getSearchResults(site, search) {
  try {
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    var page = await browser.newPage();
    await page.goto(site + '/s/?q=' + search);

    var searchResults = await page.evaluate(async () => {
      var searchResults = document.querySelector('div#SearchResults');
      var tableRows = searchResults.querySelectorAll('tr');
      var results = [];

      tableRows.forEach(item => {
        if (item.classList.value === 'header') {
        } else {
          results.push({
            name: item.querySelectorAll('td')[1].querySelector('a').innerText,
            link: item.querySelectorAll('td')[1].querySelector('a').href,
            seeds: item.querySelectorAll('td')[2].innerText,
            details: item.querySelectorAll('td')[1].querySelector('font.detDesc').innerText
          });
        }
      });
      return { error: false, results };
    });

    await page.close();
    await browser.close();

    return searchResults;
  } catch (err) {
    console.log(err);
    return { error: true, message: 'Runtime error occured' };
  }
}

async function getTorrent(link) {
  try {
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    var page = await browser.newPage();
    await page.goto(link);

    var searchResults = await page.evaluate(async () => {
      var detailsFrame = document.querySelector('div#detailsframe');
      var title = detailsFrame.querySelector('div#title').innerText;
      var downloadLink = detailsFrame.querySelector('div.download > a').href;
      var info = detailsFrame.querySelector('div.nfo > pre').innerText;

      var infoTitle = document.querySelectorAll('dt');
      var infoText = document.querySelectorAll('dd');
      var i = 0;
      var details = [];
      infoTitle.forEach(text => {
        if (text.innerText !== 'Info Hash:' && text.innerText !== 'Comments') {
          details.push({ infoTitle: text.innerText, infoText: infoText[i].innerText });
        }
        i += 1;
      });

      return { error: false, torrent: { title, info, downloadLink, details } };
    });

    await page.close();
    await browser.close();

    return searchResults;
  } catch (err) {
    console.log(err);
    return { error: true, message: 'Runtime error occured' };
  }
}

app.prepare().then(() => {
  const server = express();

  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

  server.get('/getSearch', async (req, res) => {
    let search = req.query.search;
    let site = req.query.site;
    if (search === '' || !search || site === '' || !site) {
      res.send({ error: true, errorMessage: 'Site or search cannot be empty' });
    } else {
      return searchCache({ req, res, site, search });
    }
  });

  server.get('/getTorrent', async (req, res) => {
    let link = req.query.link;
    if (link === '' || !link) {
      res.send({ error: true, errorMessage: 'Link cannot be empty' });
    } else {
      return torrentCache({ req, res, link });
    }
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
