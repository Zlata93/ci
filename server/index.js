const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars').create({ defaultLayout: 'main'});
const axios = require('axios');
const { port, repo } = require('./config');
const generateId = require('./utils/generateId');
const getBuildInfo = require('./utils/getBuildInfo');
const freePort = require('./utils/freePort');

let agents = [];
const builds = [];

const app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || port);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('home', { builds });
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
        const startTime = new Date().toLocaleTimeString();

        axios
            .get(`http://${agent.host}:${agent.port}/build?id=${generateId()}&repo=${repo}&commit_hash=${commit_hash}&build_command=${encodeURIComponent(build_command)}`)
            .then(response => {
                const endTime = new Date().toLocaleTimeString();

                agent.isFree = true;

                const buildInfo = response.data;
                buildInfo.commit_hash = commit_hash;
                buildInfo.build_command = build_command;
                buildInfo.start_time = startTime;
                buildInfo.end_time = endTime;

                builds.push(buildInfo);
                res.send(buildInfo);
            })
            .catch(err => {
                // console.log(err);
                const buildInfo = {
                    commit_hash,
                    build_command,
                    start_time: startTime,
                    end_time: new Date().toLocaleTimeString(),
                    status: 'Failure',
                    stdout: '',
                    stderr: '',
                    error: err,
                    id: generateId()
                };
                builds.push(buildInfo);
                agents = agents.filter(item => item.port !== agent.port);
                res.json(buildInfo);
            })
    } else {
        res.json({ status: 'Occupied' });
    }
});

app.get('/notify_agent', (req, res) => {
    // console.log(`Host: ${req.query.host}`);
    // console.log(`Port: ${req.query.port}`);
    const { host, port } = req.query;
    const agent = { host, port, isFree: true };
    agents.push(agent);
    res.json({ status: 'Success' });
});

app.get('/notify_build_result', (req, res) => {
    // console.log(`Id: ${req.query.id}`);
    // console.log(`Status: ${req.query.status}`);
    const { id, status, stdout, stderr, port } = req.query;
    freePort(port, agents);
    res.send({ id, status, stdout, stderr });
});

app.get('/build/:buildId', (req, res, next) => {
    const { buildId } = req.params;
    getBuildInfo(buildId, builds, (error, build) => {
        if (error) {
            return res.send({ error });
        } else {
            return res.render('build', { build });
        }
    });
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