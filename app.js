const express = require("express")
const path = require("path")
const pg = require("pg")
const bodyParser = require("body-parser")
const env = require("dotenv")

env.config()
const app = express()
const port = 3000


// Connecting to the db
const db = new pg.Client({
    user:process.env.USER,
    host:process.env.HOST,
    database:process.env.DATABASE,
    password:process.env.PASSWORD,
    port:process.env.PORT,
  });
db.connect();


async function fetchData (){
    let blogpostData = await db.query("SELECT * FROM blogpost")
    dataArray = blogpostData.rows
    return dataArray
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"))
app.set('view engine', 'ejs')

// Server Endpoints
app.get("/writeblog",(req,res)=>{
    res.sendFile(path.join(__dirname,"form.html"))
})
app.get("/allblogs",async(req,res)=>{
    try {
        dataArray = await fetchData()
    } catch (error) {
        console.log(error)
    }
    res.render(("allblogs.ejs"),{dataArray:dataArray})
   
})
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"index.html"))
})
app.post("/deleteblog",(req,res)=>{
    id = req.body.button
    db.query(`DELETE FROM blogpost WHERE id = ${id} `)
    res.redirect("/allblogs")
})
app.post("/seefullblog", async(req,res)=>{
    id = req.body.button
    let blogpostData = await db.query(`SELECT * FROM blogpost WHERE id = ${id}`)
    dataArray = blogpostData.rows
    res.render("fullblog.ejs",{dataArray:dataArray[0]})

})
app.post('/submit', async(req,res)=>{
    try {
        await db.query("INSERT INTO blogpost (title, discription, post) VALUES ($1, $2, $3);",
            [req.body.title,req.body.discription, req.body.blogarea])
        res.redirect("/writeblog")
    } catch (err) {
        console.log(err);
        alert("Error Occured")
    }
})

// Server Running
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})