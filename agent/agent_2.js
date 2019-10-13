const express = require('express');
const axios = require('axios');
const { exec, spawn } = require('child_process');
const { port2, hostPort } = require('./config');

const app = express();

app.set('port', process.env.PORT || port2);

let isRegisterSuccess = true;

const registerAgent = () => {
    axios.get(`http://localhost:${hostPort}/notify_agent?host=localhost&port=${port2}`)
        .then(res => {
            console.log(res.data);
            console.log(res.status);
        }).catch(err => {
        isRegisterSuccess = false;
        console.log('error');
    });
};

registerAgent();

setTimeout(() => {
    if (!isRegisterSuccess) {
        registerAgent();
    }
}, 10000);

app.get('/build', (req, res) => {
    console.log(`id: ${req.query.id}`);
    console.log(`repo: ${req.query.repo}`);
    console.log(`commit hash: ${req.query.commit_hash}`);
    console.log(`build command: ${req.query.build_command}`);
    const { id, repo, commit_hash, build_command } = req.query;

    exec(`git clone --single-branch --branch ${commit_hash} ${repo} ${id}`, (error, stdout, stderr) => {
        if (error) {
            return res.json({ status: 'Failed', error });
        } else {
            const child = spawn(`cd ${id} && ${build_command} && echo $?`, { shell: true });
            let output = '';
            let err = null;
            child.stdout.on('data', (data) => {
                output += data.toString();
            });
            child.stderr.on('data', (data) => {
                err += data.toString();
            });
            child.on('exit', (code, signal) =>  {
                const status = code === 0 ? 'Success' : 'Failure';
                axios.get(`http://localhost:${hostPort}/notify_build_result?port=${port2}&id=${id}&status=${status}&stdout=${encodeURIComponent(output)}&stderr=${encodeURIComponent(err)}`)
                    .then(response => {
                        console.log('Response to agent after build: ', response.data);
                        res.send(response.data);
                    })
                    .catch(error => {
                        console.log('ERROR: ', error);
                        res.send({ error });
                    });
            });
        }
    });
});

app.listen(app.get('port'), () => {
    console.log('Express is running on port ' + app.get('port'));
});
