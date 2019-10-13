const express = require('express');
const { port2 } = require('./config');
const createAgent = require('./utils/createAgent');

const app = express();

app.set('port', process.env.PORT || port2);

createAgent(port2, app);

app.listen(app.get('port'), () => {
    console.log('Express is running on port ' + app.get('port'));
});
