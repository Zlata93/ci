const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars').create({ defaultLayout: 'main'});
const axios = require('axios');
const { port, repo } = require('./config');

const generateId = () => {
    return '_' + Math.random().toString(36).substr(2, 5);
};

const agents = [];
const builds = [];

const app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || port);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/build', (req, res) => {
    console.log(`Commit hash: ${req.body.commit_hash}`);
    console.log(`Build command: ${req.body.build_command}`);
    const { commit_hash, build_command } = req.body;
    const freeAgents = agents.filter(agent => {
        return agent.isFree;
    });
    console.log('FREE: ', freeAgents);
    if (freeAgents.length) {
        const agent = freeAgents[0];
        agent.isFree = false;
        axios
            .get(`http://${agent.host}:${agent.port}/build?id=${generateId()}&repo=${repo}&commit_hash=${commit_hash}&build_command=${build_command}`)
            .then(response => {
                // console.log(response.data);
                res.send(response.data);
            })
            .catch(err => {
                console.log(err);
                res.json({ status: 'Build failed' });
            })
    } else {
        res.json({ status: 'Occupied' });
    }
});

app.get('/notify_agent', (req, res) => {
    console.log(`Host: ${req.query.host}`);
    console.log(`Port: ${req.query.port}`);
    const { host, port } = req.query;
    const agent = { host, port, isFree: true };
    agents.push(agent);
    console.log(agents);
    res.json({ status: 'Success' });
});

app.get('/notify_build_result', (req, res) => {
    console.log(`Id: ${req.query.id}`);
    console.log(`Status: ${req.query.status}`);
    // console.log(`stdout: ${req.query.stdout}`);
    // console.log(`stderr : ${req.query.stderr }`);
    const { id, status, stdout, stderr, port } = req.query;
    for (let agent of agents) {
        if (agent.port === port) {
            agent.isFree = true;
        }
    }
    builds.push({ id, status, stdout, stderr });
    res.send({ id, status, stdout, stderr });
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
