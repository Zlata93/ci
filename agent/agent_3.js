const express = require('express');
const { port3 } = require('./config');
const createAgent = require('./utils/createAgent');

const app = express();

app.set('port', process.env.PORT || port3);

createAgent(port3, app);

app.listen(app.get('port'), () => {
    console.log('Express is running on port ' + app.get('port'));
});
