// Carregando Módulos
const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require ("../helpers/eAdmin")


// Rotas
router.get('/', eAdmin, function(req, res){
    res.render("admin/index")
})

router.get('/posts', eAdmin, function(req, res){
    res.send("Página de Posts")
})

// Para Listar Categorias
router.get('/categorias', eAdmin, function(req, res){
    Categoria.find().sort({nome:'asc'}).then(function(categorias){
        res.render("admin/categorias", {categorias: categorias})
    }).catch(function(err){
        req.flash("error_msg", "Houve um erro ao listar as categorias.")
        res.redirect("/admin")
    })
})

// Para Adicionar Categorias
router.get('/categorias/add', eAdmin, function(req, res){
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', eAdmin, function(req, res){

    // Validação de Erros
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    //if(!req.body.nome.length < 2 ){
     //   erros.push({texto: "Nome da Categoria muito pequeno"})
    //}

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(function(){
            req.flash("success_msg", "Categoria criada com Sucesso!")
            res.redirect("/admin/categorias")
        }).catch(function(err){
            req.flash("error_msg", "Houve um erro ao salvar a categoria.")
            res.redirect("/admin")
        })
    }
})

// Para Editar Categorias // Recebe as informações da categoria
router.get("/categorias/edit/:id", eAdmin, function(req, res){
    Categoria.findOne({_id:req.params.id}).then(function(categoria){
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch(function(err){
        req.flash("error_msg", "Está categoria não existe.")
        res.redirect("/admin/categorias")
    })
    
})

// Para Editar Categorias // Salva no banco de dados as alterações
router.post("/categorias/edit", eAdmin, function(req, res){
    Categoria.findOne({_id: req.body.id}).then(function(categoria){
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(function(){
            req.flash("success_msg", "Categoria editada com Sucesso!")
            res.redirect("/admin/categorias")
        }).catch(function(err){
            req.flash("error_msg", "Houve um erro ao interno ao editar a categoria.")
            res.redirect("/admin/categorias")
        })

    }).catch(function(err){
        req.flash("error_msg", "Houve um erro ao editar a categoria.")
        res.redirect("/admin/categorias")
    })
})


// Para Deletar Categorias
router.post("/categorias/deletar", eAdmin, function(req, res){
    Categoria.remove({_id: req.body.id}).then(function(){
        req.flash("success_msg", "Categoria deletada com Sucesso!")
        res.redirect("/admin/categorias")
    }).catch(function(err){
        req.flash("error_msg", "Houve um erro ao deletar a categoria.")
        res.redirect("/admin/categorias")
    })
})

// Para Listar Postagens
router.get("/postagens", eAdmin, function(req, res){
    Postagem.find().populate("categoria").sort({data: "desc"}).then(function(postagens){
        res.render("admin/postagens", {postagens: postagens}).catch(function(err){
            req.flash("error_msg", "Houve um erro ao listar as postagens.")
            res.redirect("/admin")
        })

    })
})

// Para Adicionar Postagens
router.get("/postagens/add", eAdmin, function(req, res){
    //Faz a pesquisa pra listar as categorias
    Categoria.find().then(function(categorias){
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch(function(err){
        req.flash("error_msg", "Houve um erro ao carregar o formúlario de postagem.")
        res.redirect("/admin")
    })
})

// Para Salvar Postagens
router.post("/postagens/nova", eAdmin, function(req, res){
    var erros = []
    if(req.body.categoria =="0"){
        erros.push({texto:"Categoria Inválida, registre uma categoria."})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            conteudo: req.body.conteudo,
            descricao: req.body.descricao,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(function(){
            req.flash("success_msg", "Postagem criada com Sucesso!")
            res.redirect("/admin/postagens")
        }).catch(function(err){
            req.flash("error_msg", "Houve um erro ao salvar a postagem.")
            res.redirect("/admin/postagens")
        })
    }

})

// Para Editar Postagens // Recebe as info pro formulário de edição.
router.get("/postagens/edit/:id", eAdmin, function(req, res){
    
    Postagem.findOne({_id: req.params.id}).then(function(postagem){

        Categoria.find().then(function(categorias){
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch(function(err){
            req.flash("error_msg", "Houve um erro ao listar categorias.")
            req.redirect("/admin/postagens")
        })

    }).catch(function(err){
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição de postagens")
        req.redirect("/admin/postagens")
    })
    
})

// Para Editar Postagens
router.post("/postagens/edit", eAdmin, function(req, res){
    Postagem.findOne({_id: req.body.id}).then(function(postagem){

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(function(){
            req.flash("success_msg", "Postagem editada com Sucesso!")
            res.redirect("/admin/postagens")
        }).catch(function(err){
            req.flash("error_msg", "Houve um erro ao interno ao editar a postagem.")
            res.redirect("/admin/postagens")
        })

        


    }).catch(function(err){
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        req.redirect("/admin/postagens")
    })
})

// Para Deletar Postagens (Outro método é mais recomendado)
router.get("/postagens/deletar/:id", eAdmin, function(req, res){
    Postagem.remove({_id: req.params.id}).then(function(){
        req.flash("success_msg", "Mensagem Deletada com Sucesso.")
        res.redirect("/admin/postagens")
    }).catch(function(err){
        req.flash("error_msg", "Houve um erro interno ao deletar a postagem.")
        req.redirect("/admin/postagens")
    })
})

module.exports = router
