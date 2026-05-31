const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const cors= require('cors');
app.use(cors());
app.use(express.json());
const port=process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
.then(()=>{
    console.log('db connected successfully');
})
.catch((error)=>{console.log(error)});

const todoSchema = new mongoose.Schema({
    title: {
        required:true ,
        type:String
    },
    description: String
 });

const todoModel=mongoose.model('Todo', todoSchema);
app.post('/todos',async(req,res)=>{
  const {title,description}=req.body;
  const newTodo = new todoModel({title, description});
  try {
      await newTodo.save();
      res.status(201).json(newTodo);
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  }

});

app.get('/todos', async (req,res)=>{
try{
   const todos = await todoModel.find();
   res.json(todos);
}
catch(error){
    res.json({error:error.message})
    console.log(error);
}
});

app.put('/todos/:id', async (req,res)=>{
    try{
    const {title, description} = req.body;
    const id=req.params.id;
    const updateTodo= await todoModel.findByIdAndUpdate(
        id,
        {title, description},
        {new: true}
    )
    if(!updateTodo){
        return res.status(404).json({message:"can't find the id"})
    }
    res.json(updateTodo)
   }
   catch(err){
    console.log(err)
    res.json(err)
   }
});

app.delete('/todos/:id',async (req,res)=>{
    try{
       const id=req.params.id;
       await todoModel.findByIdAndDelete(id);
       res.status(204).end();
    }
    catch(err){
        console.log(err);
        res.json(err);
    }
});

app.listen(port,()=>{
    console.log(`port ${port} is running on the server!`)
});
