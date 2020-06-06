const http = require('http');

const https = require('https');

const port = 8080;

const nstatic = require('node-static');

const file = new nstatic.Server('./static');

const url = require('url');

const fs = require('fs');

const apiKey = process.env.API_KEY;
console.log('Api key: '+apiKey);



function pDownload(pUrl, dest) {
  const vfile = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    let responseSent = false; // flag to make sure that response is sent only once.
    https.get(pUrl, (response) => {
      response.pipe(vfile);
      vfile.on('finish', () => {
        vfile.close(() => {
          if (responseSent) return;
          responseSent = true;
          resolve();
        });
      });
    }).on('error', (err) => {
      if (responseSent) return;
      responseSent = true;
      reject(err);
    });
  });
}

http.createServer((req, res) => {
  const urlParsed = url.parse(req.url, true);
  const path = urlParsed.pathname;
  if (path === '/update') {
    // Table
    pDownload(`https://sheets.googleapis.com/v4/spreadsheets/1bauKrfVdg2nnJLO_TUVvG_tLfWjvRJRu16klsWu1XcM/values/objects!A1:J5000?key=${apiKey}`, './static/json/objects.json')
    /*  .then(() => {
        console.log('district - downloaded file no issues...')
        return pDownload('https://sheets.googleapis.com/v4/spreadsheets/1ShswXuI-IhGlR1TbDXQbtSF7C2QshLQHQcEIwf38Hao/values/district!A2:I475?key=', './static/json/district.json');
      })// uik
      .then(() => {
        console.log('uik - downloaded file no issues...');
        return pDownload('https://sheets.googleapis.com/v4/spreadsheets/16mEcbu8lQA9PpzB6TO9igYALVYkUJYmf0a5BMHaQFdA/values/uik!A2:j1250?key=', './static/json/uik.json');
      })// meropr
      .then(() => {
        console.log('meropr - downloaded file no issues...');
        return pDownload('https://sheets.googleapis.com/v4/spreadsheets/16mEcbu8lQA9PpzB6TO9igYALVYkUJYmf0a5BMHaQFdA/values/meropr!A2:I178?key=', './static/json/meropr.json');
      })// Ansamb
      .then(() => {
        console.log('Ansamb - downloaded file no issues...');
        return pDownload('https://sheets.googleapis.com/v4/spreadsheets/16mEcbu8lQA9PpzB6TO9igYALVYkUJYmf0a5BMHaQFdA/values/ansam!A2:I29?key=', './static/json/ansam.json');
      })// agit
      .then(() => {
        console.log('agit - downloaded file no issues...');
        return pDownload('https://sheets.googleapis.com/v4/spreadsheets/16mEcbu8lQA9PpzB6TO9igYALVYkUJYmf0a5BMHaQFdA/values/agit!A2:I29?key=', './static/json/agit.json');
      })// reserve
      .then(() => {
        console.log('reserve - downloaded file no issues...');
        return pDownload('https://sheets.googleapis.com/v4/spreadsheets/16mEcbu8lQA9PpzB6TO9igYALVYkUJYmf0a5BMHaQFdA/values/reserve!A2:I170?key=', './static/json/reserve.json');
      })   
      */
      .then(() => {console.log('DATA - downloaded file no issues...')
        res.end('Update from google document - json OK ');
      })
      .catch((e) => {
        console.error('ERROR !!!  error while downloading', e)
        res.status(500).end('Error'+e);
      });
  } else {
    // console.log(urlParsed);
    file.serve(req, res);
  }
}).listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }
  return null;
});

console.log('Server running on port 8080');
