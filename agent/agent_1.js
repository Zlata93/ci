const express = require('express');
const axios = require('axios');

const app = express();

app.set('port', process.env.PORT || 9001);

let isRegisterSuccess = true;

const registerAgent = () => {
    axios.get('http://localhost:9000/notify_agent?host=localhost&port=9001')
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

app.listen(app.get('port'), () => {
    console.log('Express is running on port ' + app.get('port'));
});
