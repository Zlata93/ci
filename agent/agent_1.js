const express = require('express');
const { port1 } = require('./config');
const createAgent = require('./utils/createAgent');

const app = express();

app.set('port', process.env.PORT || port1);

createAgent(port1, app);

app.listen(app.get('port'), () => {
    console.log('Express is running on port ' + app.get('port'));
});
