const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// Definindo um Model

const Usuario = new Schema({
    nome: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    eAdmin: {
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        require: true
    }
})

mongoose.model("usuarios", Usuario)
