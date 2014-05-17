var http = require('http')
	, express = require('express')
	, app = express()
	, port = process.env.PORT || 5000;

app.set('views', __dirname + '/app/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.use(express.static(__dirname))

app.get('/', function(req, res) {
  res.render('index');
});

var server = http.createServer(app)
server.listen(port);