import { useState,useEffect } from 'react'
import axios from "axios";
const API_BASE = "http://localhost:3000";

function App() {
  const[username,setusername] = useState("");
 const[token,settoken] = useState(localStorage.getItem("token") ||"");
 const[tokendata,settokendata] = useState("");
 const[data,setdata] = useState();
 const[sub,setsub] = useState(false);

 const[task,settask] = useState("");
 const[desc,setdesc] = useState("");
 const[tasks,settasks] = useState();
 const[task_added_flag,settask_added_flag] = useState(false);
 const[editingid,seteditingid] =useState(null);

useEffect(()=>{
  if(token && sub){
    getdata(token);
  }
},[task_added_flag]);





 async function gettoken(){
  try{
    if(!username){
      alert("username nahi hain");
      return ;
    }
    const res = await axios.post(`${API_BASE}/api/token`,{username});
    localStorage.setItem("token",res.data.token);
    settoken(res.data.token);
    settokendata(res.data.message);
    return res.data.token;


  }
  catch(err){
    console.log(err.response.data.message);

  }
 }

 async function getdata(freshtoken){
  try{
    const res = await fetch(`${API_BASE}/api/get`,{
      headers:{"Authorization":`Bearer ${freshtoken}`}
    });
    const data =  await res.json();
    setdata(data.message);
    settasks(data.task);
    return res;

  }
  catch(err){
    setdata(err.message);
  }
 }

 async function handlesubmit(){
  try{
    if(!username){
      alert("enter username");
      return;
    }
    
    const freshtoken = await gettoken();
    let s;
    if(freshtoken){
      s = await  getdata(freshtoken);
    }
    if(s.ok){
      setsub(true);
    }
      
    
    
    

  }
  catch(err){
    console.log(err.response.message);
  }
 }

 function handlelogout(){
  settoken("");
  localStorage.removeItem("token");
  setdata("");
  settokendata("");
  setsub(false);
  setusername("");
 }
 async function givetask(){
  try{
     const res = await axios.post(`${API_BASE}/api/tasks`,{username,task,desc});
     console.log(res.data.message);
     settask_added_flag((prev)=>!prev);
     settask("");
     setdesc("");


  }
  catch(err){
    console.log(err.message);
  }
}
  async function handleedit(id,desc,title){
    seteditingid(id);
   setdesc(desc);
   settask(title);
  }

  async function handlesafeedit(){
    if(!task || !desc){
      alert("task ya desc missing hain");
      return;
    }
    try{
      if(editingid !== null){
        const res= await axios.put(`${API_BASE}/api/put`,{editingid,username,task,desc});
        console.log(res.data.message);

      }
      
      setdesc("");
      settask("");
      settask_added_flag((prev)=>!prev);
      seteditingid(null);
    }catch(err){
      console.log(err.message);
    }
  }
  async function handledelete(id){
    try{
      const res = await axios.delete(`${API_BASE}/api/delete`,{data:{username,id}});
      console.log(res.data.message);
      settask_added_flag((prev)=>!prev);

    }
    catch(err){
      console.log(err.message);
    }
  }
  return (
    <>
    {sub?(
      <>
      <button style = {{width:"50px",float:"right"}} onClick = {handlelogout}>logout</button>
      <div style = {{border:"1px solid black"}}>
         <p style ={{color:"blue"}}>{token}</p>
      <p style = {{color:"red"}}>{tokendata}</p>
      <p style = {{color:"green"}}>{data}</p>
      </div>

      
        <p><input type="text" placeholder = "enter task name" value={task} onChange = {(e)=>{settask(e.target.value)}} /></p>
        <p><textarea  value = {desc} placeholder = "enter text..." row = "40" cols = "40" onChange = {(e)=>{setdesc(e.target.value)}}></textarea></p>
       {editingid !== null?(
        <button id = "submit" onClick = {()=>{handlesafeedit();
          
        }}>
          upload task
          </button>
          ):
          (<button id = "submit" onClick = {()=>{givetask();
          
        }}>
          add task
          </button>)}
        
    

      <div>
        {Array.isArray(tasks) && tasks.map((item,index)=>(
          <div key= {item.id} style = {{border:"1px solid black",width:"50%",align:"center"}}>
            <p>{item.title}</p>
            <p>{item.desc}</p>
            <p>{item.id}</p>
            <button onClick={()=>{handleedit(item.id,item.desc,item.title)}}>edit</button>
            <button onClick = {()=>{handledelete(item.id)}}>delete</button>
          </div>
        ))}
      </div>


     
      </>
      )
    :
    (
    <> 
    <h1>dashboard</h1>
    
    <p><strong>enter your name:</strong><input type = "text" onChange = {(e)=>{setusername(e.target.value)}}/></p>
    <button onClick = {handlesubmit}>submit</button>
    </>
  )
  }
   


    </>
  )
}

export default App
