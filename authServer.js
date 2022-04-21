require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const res = require('express/lib/response');

const app = express();
app.use(express.json());

let refreshTokens = [];

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// manually handling refresh token
app.post('/token', (req, res)=>{
    const refreshToken = req.body.token;
    if(refreshToken == null){return res.status(401).json({
        message: 'Unauthorized',
        status: 401
    });}
    if(!refreshTokens.includes(refreshToken)){return res.status(403).json({
        message: 'Forbidden',
        status: 403
    });}
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if(err){return res.status(403).json({message: 'Forbidden', status: 403});}
        console.log(user);
        const accessToken = generateAccessToken({name: user.name});
        res.status(200).json({ accessToken: accessToken, message: 200 });
    });
});

app.delete('/logout', (req, res)=>{
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    return res.status(200).json({
        message: 'Successfully deleted the refresh token',
        status: 200
    });
});

app.post('/login', (req, res)=>{
    // Authenticate a user
    const username = req.body.username;
    const user = { name: username };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, message: "Login Successful" });
});

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1min' });
}

const PORT = 4000;
app.listen(PORT, (err)=>{
    if(err){console.log("Error ",err);return;}
    console.log(`Server is up and running in Port ${PORT}`);
});