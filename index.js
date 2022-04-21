require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const res = require('express/lib/response');



const posts = [
    {
        username: "Suriyaa", 
        title: "Post1"
    },
    {
        username: "Gayathri",
        title: "Post2"
    }
]

const app = express();
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/posts', authenticateToken, (req, res)=>{

    res.json(posts.filter(post=> post.username === req.user.name));
});

app.post('/login', (req, res)=>{
    // Authenticate a user
    const username = req.body.username;
    const user = { name: username };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken });
});

function authenticateToken(req, res, next){
    console.log(req.headers);
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);
    if(token==null){return res.status(401).json({
        message: 'Unauthorized',
        status: 401
    });}
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err){console.log("Error ",err);return res.status(403).json({
            message: 'Forbidden Error',
            status: 403
        });}
        console.log(user);
        req.user = user;
        next();
    });
}

const PORT = 3000;
app.listen(PORT, (err)=>{
    if(err){console.log("Error ",err);return;}
    console.log(`Server is up and running in Port ${PORT}`);
});