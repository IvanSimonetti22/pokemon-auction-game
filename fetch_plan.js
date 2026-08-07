const http = require('http');
const fs = require('fs');

http.get('http://23.175.40.14:25117/v1/player?player=NaviFFx', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('plan_naviffx.json', data);
    console.log('Done downloading data!');
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
