/*
* Server is just here as a test harness - prevents canvas thrwoing cross origin errors.
*/

const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.writeHead(301,
    {Location: 'index.html'}
  );
  res.end();
})

app.use(express.static('public'))

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})