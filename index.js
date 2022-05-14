const express =  require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
const moment = require('moment')
const Client = require('./models/Client')
const Menu = require('./models/Menu')
const Order = require('./models/Order')

dotenv.config();

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}));
const port = process.env.ENVIRONMENT_PORT;

///conexion a base de datos
const mongoose = require('mongoose');
const user = 'user_pizza';
const password = 'AGVYsJDAZ8PVNYpD';
const dbname ='bd_Pizzeria';
const uri = `mongodb+srv://${user}:${password}@cluster0.fhugt.mongodb.net/${dbname}?retryWrites=true&w=majority`;


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('conectado a mongodb')) 
  .catch(e => console.log('error de conexión', e))

app.get('/', function (req, res) {
  res.send('NAPO');
});

///variables
let idClient;
let idMenu;
let cantidad;
let importeTotal;
let pago;
let response;


//orden
app.post('/order', (req, res) => {
  console.log(req.body.sessionInfo);
  const tag = req.body.fulfillmentInfo.tag;
  if (!!tag) {
    switch (tag) {
      case 'cargar_order':
        console.log(req.body.sessionInfo);
        idClient = req.body.sessionInfo.parameters['idClient'];
        idMenu = req.body.sessionInfo.parameters['idMenu'];
        cantidad = req.body.sessionInfo.parameters['cantidad'];
        importeTotal = req.body.sessionInfo.parameters['importeTotal'];
       
        const newOrder = new Order({idClient,idMenu,cantidad,importeTotal}); //guardar un nuevo cliente en Mongo
        newOrder.save(); //guardar un nuevo cliente en Mongo
        console.log(newOrder);
        res.status(200).send({
          sessionInfo: {
            parameters: {
              idOrder:newOrder._id,
            }
          }
        });
        break;
  
      case 'confirm_pago':
        pago = req.body.sessionInfo.parameters['pay'];
        importeTotal = req.body.sessionInfo.parameters['importeTotal'];
        response = 'invalid';
        let valor_1 = parseFloat(pago.toString());
        let valor_2 = parseFloat(importeTotal.toString());
        if(valor_1>=valor_2){
          let vuelto = (valor_1 - valor_2).toString();
          console.log(vuelto)
          res.status(200).send({
            sessionInfo: {
              parameters: {
                vuelto: vuelto,
                response: 'valid'
              }
            }
          });
        }
        else{
          res.status(200).send({
            sessionInfo: {
              parameters: {
                vuelto: '0',
                response: response
              }
            }
          });
        }
      break;
    }
  }   
});

//menu
app.post('/menu', (req, res) => {
  console.log(req.body.sessionInfo);
  const tag = req.body.fulfillmentInfo.tag;
  let menu;
  if (!!tag) {
    switch (tag) {
      case 'consult_menu':
        console.log(req.body.sessionInfo);
        menu = req.body.sessionInfo.parameters['pizza'];
        cantidad = req.body.sessionInfo.parameters['cantidad'];
        //buscar el id del menu
        var a = Menu.find({ 
          descripcion:menu
        }, function callback(error, a) {
        a.forEach(item => {
          if (menu.toUpperCase() === item.descripcion.toUpperCase()) {
            res.status(200).send({
              sessionInfo: {
                parameters: {
                  idMenu:item._id,
                  importe: item.precio,
                  importeTotal: (parseFloat(item.precio)*parseInt(cantidad)).toString()
                }
              }
            });
          }
        });  
        })
        break;
    }
  }   
});

//client
app.post('/client', (req, res) => {
  console.log(req.body.sessionInfo);
  const tag = req.body.fulfillmentInfo.tag;
  let telefono;
  let nombre;
  let estado;
  let direccion;
  if (!!tag) {
    switch (tag) {
      case 'verificar_client':
        console.log(req.body.sessionInfo);
        nombre = req.body.sessionInfo.parameters['given-name'];
        telefono = req.body.sessionInfo.parameters['phone-number'];
        estado = 'invalid';
        //buscar el client
        var a = Client.find({ 
          telefono: telefono, nombre: nombre
        }, function callback(error, a) {
          if (a>0) {
            estado = 'valid'; //si lo encuentra cambia el estado
            a.forEach(item => {
            res.status(200).send({
              sessionInfo: {
                parameters: {
                  estado: estado,
                  address: item.direccion,
                  idClient:item._id
                }
              }
            });
          
        });
        }
        else{
          res.status(200).send({
            sessionInfo: {
              parameters: {
                estado: estado,
              }
            }
          }); 
        }
        })
        
        break;

      case 'guardar_client':
        console.log(req.body.sessionInfo);
        nombre = req.body.sessionInfo.parameters['given-name'];
        telefono = req.body.sessionInfo.parameters['phone-number'];
        direccion = req.body.sessionInfo.parameters['address'];
        try {
          const newClient = new Client({nombre,telefono,direccion}); //guardar un nuevo cliente en Mongo
          newClient.save(); //guardar un nuevo cliente en Mongo
          estado='valid';
          res.status(200).send({
            sessionInfo: {
              parameters: {
                estado: estado,
                idClient: newClient._id
              }
            }
          });
        } catch (error) {
          console.log(error)
        }
        break;
    }
  }   
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

