const express = require('express');
const dbconnect = require('./config/dbconnect.js');
const cors = require("cors");
const bodyParser = require('body-parser');
const path = require('path');

// DB Connection
dbconnect();

const app = express();
const port = 5000;

// allow json body
app.use(cors());
app.use(express.json({limit:'10mb'}))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.get('/', (req, res) => {
  res.send('http://localhost:4000/ is working! @Server2')
})

// external routes
app.use('/briefing', require('./routers/router_briefing.js'));
app.use('/staff', require('./routers/router_staff.js'));
app.use('/files', require('./routers/files.js'));
app.use('/spms', require('./routers/router_spms.js'));
app.use('/logs', require('./routers/router_logs.js'));
app.use('/shift', require('./routers/router_shiftwise.js'));
app.use('/actions', require('./routers/router_actions.js'));

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})