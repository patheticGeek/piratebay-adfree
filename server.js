const express = require('express');
const next = require('next');
const puppeteer = require('puppeteer');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function getSitesAvail() {
  try {
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    var page = await browser.newPage();
    await page.goto('https://piratebay-proxylist.se/');

    var searchResults = await page.evaluate(async () => {
      var list = document.querySelectorAll('table.proxies > tbody > tr');
      var proxies = [];
      list.forEach(item => {
        proxies.push({
          name: item.querySelectorAll('td')[0].innerText,
          site: 'https://' + item.querySelectorAll('td')[0].innerText,
          country: item.querySelectorAll('td')[1].innerText,
          speed: item.querySelectorAll('td')[2].innerText
        });
      });

      return { error: false, proxies };
    });

    await page.close();
    await browser.close();

    return searchResults;
  } catch (err) {
    console.log(err);
    return { error: true, message: 'Runtime error occured' };
  }
}

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
      var uploaded = detailsFrame.querySelectorAll('div#details > .col2 > dd')[0].innerText;
      if (detailsFrame.querySelectorAll('div#details > .col2 > dd')[0]) {
        var uploaded = detailsFrame.querySelectorAll('div#details > .col2 > dd')[0].innerText;
      } else {
        var uploaded = 'not avail';
      }
      if (detailsFrame.querySelectorAll('div#details > .col2 > dd')[2]) {
        var seeds = detailsFrame.querySelectorAll('div#details > .col2 > dd')[2].innerText;
      } else {
        var seeds = 'not avail';
      }
      var downloadLink = detailsFrame.querySelector('div.download > a').href;
      var info = detailsFrame.querySelector('div.nfo > pre').innerText;
      if (detailsFrame.querySelectorAll('div#details > .col2 > dd')[1]) {
        var uploadedBy = detailsFrame.querySelectorAll('div#details > .col2 > dd')[1].innerText;
      } else {
        var uploadedBy = 'not avail';
      }

      return { error: false, torrent: { title, uploaded, uploadedBy, seeds, info, downloadLink } };
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

  server.get('/sitesAvail', async (req, res) => {
    res.send(await getSitesAvail());
  });

  server.get('/getSearch', async (req, res) => {
    let search = req.query.search;
    let site = req.query.site;
    if (search === '' || !search || site === '' || !site) {
      res.send({ error: true, errorMessage: 'Site or search cannot be empty' });
    } else {
      res.send(await getSearchResults(site, search));
    }
  });

  server.get('/getTorrent', async (req, res) => {
    let link = req.query.link;
    if (link === '' || !link) {
      res.send({ error: true, errorMessage: 'Link cannot be empty' });
    } else {
      res.send(await getTorrent(link));
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
