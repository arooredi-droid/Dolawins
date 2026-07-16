const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const DB_FILE = path.join(__dirname, "database.json");

function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.post("/api/register", (req, res) => {

    const db = loadDB();

    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({
            success:false,
            message:"Username and password required"
        });
    }

    if (db.users[username]) {
        return res.json({
            success:false,
            message:"Username already exists"
        });
    }

    db.users[username]={
        username,
        password,
        points:0,
        pendingRewards:0,
        subscription:false,
        history:[]
    };

    saveDB(db);

    res.json({
        success:true,
        message:"Registration successful"
    });

});

app.post("/api/login",(req,res)=>{

    const db=loadDB();

    const {username,password}=req.body;

    const user=db.users[username];

    if(!user){
        return res.json({
            success:false,
            message:"User not found"
        });
    }

    if(user.password!==password){
        return res.json({
            success:false,
            message:"Incorrect password"
        });
    }

    res.json({
        success:true,
        message:"Login successful"
    });

});

app.get("/api/user/:username",(req,res)=>{

    const db=loadDB();

    const user=db.users[req.params.username];

    if(!user){
        return res.json({
            success:false
        });
    }

    res.json(user);

});

app.post("/api/user/:username",(req,res)=>{

    const db=loadDB();

    db.users[req.params.username]=req.body;

    saveDB(db);

    res.json({
        success:true
    });

});

app.get("/api/users", (req, res) => {
    const db = loadDB();
    res.json(db.users);
});

app.post("/admin/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {
        return res.json({
            success: true
        });
    }

    res.json({
        success: false,
        message: "Invalid username or password"
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "spin.html"));
});
app.post("/admin/approve/:username", (req, res) => {
    const db = loadDB();

    const username = req.params.username;

    if (!db.users[username]) {
        return res.json({
            success: false,
            message: "User not found"
        });
    }

    db.users[username].subscription = true;

    saveDB(db);

    res.json({
        success: true,
        message: "Subscription approved"
    });
});
app.post("/api/subscribe", (req, res) => {
    const db = loadDB();

    if (!db.subscriptions) {
        db.subscriptions = [];
    }

    const {
        phone,
        transactionCode,
        amount
    } = req.body;

    db.subscriptions.push({
        phone,
        transactionCode,
        amount,
        status: "pending",
        date: new Date().toLocaleString()
    });

    saveDB(db);

    res.json({
        success: true,
        message: "Subscription request submitted."
    });
});
app.post("/api/subscribe", (req, res) => {
    const db = loadDB();

    if (!db.subscriptions) {
        db.subscriptions = [];
    }

    const { phone, transactionCode, amount } = req.body;

    db.subscriptions.push({
        phone,
        transactionCode,
        amount,
        status: "pending",
        date: new Date().toLocaleString()
    });

    saveDB(db);

    res.json({
        success: true,
        message: "Subscription request received."
    });
});
app.listen(PORT, () => {
    console.log("Dolawins server running on port 3000");
});
