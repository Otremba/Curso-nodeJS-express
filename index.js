const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')

const path = require('path');

const app = express();

const Posts = require('./Posts.js');

mongoose.connect('mongodb+srv://rickrevolution79:<PASS>@cluster0.d2l3eca.mongodb.net/portal?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log('Conectado com sucesso');
}).catch(function(err){
    console.log(err.message);
})

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));


app.get('/',(req,res)=>{
    
    if(req.query.busca == null){
        Posts.find({}).sort({'_id': -1}).exec(function(err,posts){
           // console.log(posts[0]);
            posts = posts.map(function(val){
                console.log(val);
                    return {
                        title: val.title,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,100),
                        image: val.image,
                        slug: val.slug,
                        category: val.category
                        
                    }
            })

            
            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
                // console.log(posts[0]);
                 postsTop = postsTop.map(function(val){
                         return {
                             title: val.title,
                             conteudo: val.conteudo,
                             descricaoCurta: val.conteudo.substr(0,100),
                             image: val.image,
                             slug: val.slug,
                             category: val.category,
                             views: val.views
                             
                         }
                 })

                 

                 res.render('home',{posts:posts,postsTop:postsTop});
                
             })

             

            
        })
        
    }else{

        Posts.find({title: {$regex: req.query.busca,$options:"i"}},function(err,posts){
            console.log(posts);
            posts = posts.map(function(val){
                return {
                    title: val.title,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    image: val.image,
                    slug: val.slug,
                    category: val.category,
                    views: val.views
                    
                }
        })
            res.render('busca',{posts:posts,contagem:posts.length});
        })


        
    }

  
});


app.get('/:slug',(req,res)=>{
    //res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views: 1}}, {new: true},function(err,resposta){
       // console.log(resposta);
       if(resposta != null){

        Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
            // console.log(posts[0]);
             postsTop = postsTop.map(function(val){
                     return {
                         title: val.title,
                         conteudo: val.conteudo,
                         descricaoCurta: val.conteudo.substr(0,100),
                         image: val.image,
                         slug: val.slug,
                         category: val.category,
                         views: val.views
                         
                     }
             })

             res.render('single',{noticia:resposta,postsTop:postsTop});

            })


        
       }else{
           res.redirect('/');
       }
    })
    
})



app.listen(5000,()=>{
    console.log('server rodando!');
})