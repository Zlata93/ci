const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars').create({ defaultLayout: 'main'});

const app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 9000);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/build', (req, res) => {
    console.log(`Commit hash: ${req.body.commit_hash}`);
    console.log(`Build command: ${req.body.build_command}`);
    res.json({ status: 'Success' });
});

app.get('/notify_agent', (req, res) => {
    console.log(`Commit hash: ${req.query.host}`);
    console.log(`Build command: ${req.query.port}`);
    res.json({ status: 'Success' });
});

app.use((req, res) => {
    res.status(404);
    res.render('404');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), () => {
    console.log('Express is running on port ' + app.get('port'));
});
