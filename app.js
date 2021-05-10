var express = require('express');
app = express();

app.get('/', function (req, res) {
  res.send('Hello wonderful world. Welcome to IBM, RedHat and Opensource! Demo para Jenkins\n');
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

