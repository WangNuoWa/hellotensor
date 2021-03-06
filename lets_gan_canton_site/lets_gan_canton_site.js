var express = require('express')
var app = express()
var fs = require('fs')
var path = require('path');
var low = require('lowdb')

var r = (i)=>Math.random()*(i||1)

// deal with openshift environment
if(process.env.OPENSHIFT_DATA_DIR){
  var data_dirname = process.env.OPENSHIFT_DATA_DIR
  var db_path = process.env.OPENSHIFT_DATA_DIR + '/db.json'
}else{
  var data_dirname = __dirname + '/../'
  var db_path = 'db.json'
}

// file db
var db = low(db_path)
var state = db.getState()

state.ids = state.ids||{}

var imaginations = path.resolve(data_dirname + '/generated')
var indexhtml = path.resolve(__dirname + '/index.html')

console.log('data_dirname',data_dirname);
console.log('db_path',db_path);
console.log('imaginations',imaginations);

//express
app.get('/', (req,res)=>{
  state.visited = (state.visited||0) + 1
  db.write()
  res.sendFile(indexhtml)
})

app.get('/generated/:id',(req,res)=>{
  var id = req.params.id
  state.served = (state.served||0) + 1

  console.log(id);
  fullpath = imaginations +'/'+ id + '.jpg'
  res.sendFile(fullpath)
})

var keys = {}
var filenames = []

try{
  fs.mkdirSync(imaginations)
}catch(err){
  console.error(err);
}
var refresh_filelist = ()=>{
  //query filesystem at some interval
  fs.readdir(imaginations,(err,files)=>{
    if(err)console.error(err);
    else{
      filenames = files
    }
  })
}

refresh_filelist()

setInterval(refresh_filelist,3000)

app.get('/random',(req,res,next)=>{
  // list all imaginations
  state.asked = (state.asked||0) + 1

  if(filenames.length<1){
    throw 'no enough file to serve'
  }

  //files is list of filenames
  var index = Math.floor(r(filenames.length))
  var id = filenames[index].split('.')[0]

  var key = Math.floor(Math.random()*256*16777216).toString()
  keys[key] = 1

  // return the id
  res.json({
    id,
    key,
  })
})

// scoring
app.get('/score/:id/:score/:key',(req,res)=>{
  var id = req.params.id
  var sc = req.params.score
  var key = req.params.key
  sc = Math.floor(Number(sc))
  if((sc!==0 && sc!==1)||id.length!=50||keys[key]!==1){
    throw('bad param')
  }

  //reset the key to prevent reuse
  keys[key]=undefined

  if(state.ids[id]){
    state.ids[id][(sc==1?'p':'n')] += 1
  }else{
    state.ids[id] = {p:sc,n:1-sc}
  }

  state.scored = (state.scored||0) + 1

  db.write()
  res.json({message:'success'})
})

app.get('/score/:id',(req,res)=>{
  var id = req.params.id
  var score = state.ids[id]
  res.json(score) //{p:1,n:0}
})

app.listen(8080,()=>{ // OpenShift requirement
  console.log('listening on 8080');
})
