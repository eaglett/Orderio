const express = require('express');
const app = express();

/* Set up socket.io */
const server = require('http').createServer(app);
const io = require('socket.io')(server);

/* Setup session */
const session = require('express-session');

app.use(session({
    secret: require('./config/keys').sessionSecret,
    resave: false,
    saveUninitialized: true
}));

/* Setup Objection + Knex */

//const Model = require('objection').Model; <- same as below
const { Model } = require('objection');
const Knex = require('knex');
const knexFile = require('./knexfile.js');

const knex = Knex(knexFile.development); //connection, initialization of Knex

Model.knex(knex); //.knex() is a already build in function, this is connecting objection and knex

/* Add bootstrap*/
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

/* Add routes */
const basicRoutes = require('./routes/basicRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const businessRoutes = require('./routes/businessRoutes.js');
const customerRoutes = require('./routes/customerRoutes.js');
const verificationRoutes = require('./routes/verificationRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const menuRoutes = require('./routes/menuRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');

app.use(basicRoutes);
app.use(authRoutes);
app.use(businessRoutes);
app.use(customerRoutes);
app.use(verificationRoutes);
app.use(userRoutes);
app.use(menuRoutes);
app.use(orderRoutes);


/* Adding socket connections */
const nsp = io.of('/tracking');
nsp.on('connection', socket => {
    let currentRoom;
    socket.on('join-room', async(room) => {
        console.log("room ", room)
        await socket.join(room);
        console.log(socket.id + ' ' + JSON.stringify(socket.rooms))
        console.log('--------')
        //console.log(io.sockets.adapter.rooms)
        currentRoom = room;
    })
    socket.on('restaurant-preparing', () => {
        io.of('/tracking').in(currentRoom).emit('preparing');
    });
    socket.on('restaurant-delivering', () => {
        io.of('/tracking').in(currentRoom).emit('delivering');
    });
    socket.on('restaurant-delivered', () => {
        io.of('/tracking').in(currentRoom).emit('delivered');
    });
});


const port = process.env.PORT ? process.env.PORT : 3000;

server.listen(port, (error) => {
    if (error) {
        console.log("Error starting the server");
    }
    console.log("This server is running on port", server.address().port);
});