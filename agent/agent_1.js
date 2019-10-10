const express = require('express');

const app = express();

app.set('port', process.env.PORT || 9001);

app.listen(app.get('port'), () => {
    console.log('Express is running on port ' + app.get('port'));
});
