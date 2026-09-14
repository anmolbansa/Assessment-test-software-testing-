const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret_key_anmol_bansal";
const tokens = {};
const tasks={};
app.post("/api/token",(req,res)=>{
    const {username} = req.body;
    if(!username){
        return res.json({sucess:false,message:"username nahi hain"});

    }
    if(tokens[username]){
        return res.json({token:tokens[username],message:"token available ta app purane user hain"});

    }
    else{
        const token = jwt.sign({user:username},JWT_SECRET);
    tokens[username] = token;
    return res.json({token:tokens[username],message:"token naya hain "});
    }
    

});

const verifytoken = (req,res,next)=>{
    const headers = req.headers["authorization"];
    let header_parts;
    let token;
    if(headers){
        header_parts = headers.split(" ");
    }
    if(header_parts){
        token = header_parts[1];
    }
    jwt.verify(token,JWT_SECRET,(err,decodeddata)=>{
        if(err){
            return res.status(404).json({message:err.message});
        }
        req.user = decodeddata;
        next();

    });
    
}
app.get("/api/get",verifytoken,(req,res)=>{
    res.json({message:`${req.user.user} apka verification ho gaya`,task:tasks[req.user.user]});
})
app.post("/api/tasks",(req,res)=>{
    const{username,task,desc} = req.body;
    if(!tasks[username]){
        tasks[username]=[];
    }
    
        tasks[username].push({
        title:task,
        desc:desc,
        id:tasks[username].length,
    })

    
    
    return res.status(200).json({success:true,message:"task safe ho gaye"});



});
app.put("/api/put",(req,res)=>{
    const{username,editingid,task,desc} = req.body;
    
    if (!username || editingid == null || !task || !desc) {
        return res.status(400).json({ 
            success: false, 
            message: "payload in put main kuch missing hain" 
        });
    }
    if(!tasks[username]){
         return res.status(400).json({success:false,message:"payload in put main kuch missing hain"});
    }
     const taskindex = tasks[username].find((t)=>t.id === Number(editingid));
    
    if(taskindex){
        taskindex.title =task;
        taskindex.desc=desc; 

    }
    return res.status(200).json({success:true,message:"ho gaya edit muna"});
});
app.delete("/api/delete",(req,res)=>{
    const{id,username} = req.body;
    if(id == null || !username){
        return res.status(400).json({success:false,message:"index nahi aya"});
    }
    if(!tasks[username]){
         return res.status(400).json({success:false,message:"index nahi aya"});

    }
    const indexdel = tasks[username].findIndex((t)=>t.id == id);
    if(indexdel !==-1){
        tasks[username].splice(indexdel,1);
        let k=0;
        for(let i=0;i<tasks[username].length;i++){
            tasks[username][i].id =k++;
        }
    return res.status(200).json({success:true,message:"delete ho gaya"});

    }
    else{
         return res.status(400).json({success:false,message:"index nahi aya"});
    
    }
    

});
app.listen(3000,(req,res)=>{
    console.log("3000 par game chal raha hain");
})