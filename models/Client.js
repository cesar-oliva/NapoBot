const mongoose = require('mongoose');
const {Schema} = mongoose;

const ClientSchema = new Schema({
  nombre:  {type: String, required: true},
  telefono: {type: String, require: true},
  direccion: {type: String, required: true},
  date: {type: Date, default: Date.now}
});

// Crear el modelo
module.exports = mongoose.model('Client', ClientSchema);

