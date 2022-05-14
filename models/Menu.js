const mongoose = require('mongoose');
const {Schema} = mongoose;

const MenuSchema = new Schema({
  descripcion:  {type: String, required: true},
  precio: {type: String, require: true},
  date: {type: Date, default: Date.now}
});

// Crear el modelo
module.exports = mongoose.model('menu', MenuSchema);