const express = require("express");
const app = express();
const port = 4000;

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const methodOverride = require("method-override");
const path = require("path");

const Job = require("./models/Job");
const User = require("./models/User");
const Application = require("./models/Application");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose.connect("mongodb://127.0.0.1:27017/Job-Portal")
.then(() => console.log("DB Connected"))
.catch(err => console.log(err));

const multer = require("multer");
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });



app.get("/home", async (req,res)=>{
    const jobs = await Job.find();
    res.render("home",{jobs});
});



app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",async (req,res)=>{

    const {name,email,password} = req.body;

    const hashedPassword = await bcrypt.hash(password,10);

    const user = new User({
        name,
        email,
        password: hashedPassword
    });

    await user.save();

    res.redirect("/login");

});



app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",async (req,res)=>{

    const {email,password} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.send("User not found");
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.send("Invalid Password");
    }

    const token = jwt.sign(
        {id:user._id,email:user.email},
        "secretkey",
        {expiresIn:"1d"}
    );

    res.json({
        message:"Login successful",
        token:token
    });

});



app.get("/logout",(req,res)=>{
    res.redirect("/login");
});



app.get("/jobs",async (req,res)=>{
    const jobs = await Job.find();
    res.render("jobs",{jobs});
});



app.get("/jobs/new",(req,res)=>{
    res.render("new");
});



app.get("/jobs/search",async (req,res)=>{

    const location = req.query.location;

    const jobs = await Job.find({
        location:{ $regex: location, $options:"i"}
    });

    res.render("jobs",{jobs});

});



app.get("/jobs/:id",async (req,res)=>{

    const job = await Job.findById(req.params.id);

    res.render("show",{job});

});



app.post("/jobs",async (req,res)=>{

    const newJob = new Job({
        title:req.body.title,
        description:req.body.description,
        company:req.body.company,
        salary:req.body.salary,
        location:req.body.location
    });

    await newJob.save();

    res.redirect("/jobs");

});



app.get("/jobs/:id/edit",async (req,res)=>{

    const job = await Job.findById(req.params.id);

    res.render("edit",{job});

});



app.put("/jobs/:id",async (req,res)=>{

    await Job.findByIdAndUpdate(req.params.id,req.body);

    res.redirect("/jobs");

});



app.delete("/jobs/:id",async (req,res)=>{

    await Job.findByIdAndDelete(req.params.id);

    res.redirect("/jobs");

});


app.post("/jobs/:id/apply", upload.single("resume"), async (req,res)=>{

    const jobId = req.params.id;
    const userId = req.body.userId;

    const existing = await Application.findOne({
        job: jobId,
        user: userId
    });

    if(existing){
        return res.send("You already applied for this job");
    }

    const application = new Application({
        job: jobId,
        user: userId,
        resume: req.file.path
    });

    await application.save();

    res.send("Application submitted successfully");
});


app.get("/recruiter/dashboard", async (req,res)=>{

    const jobs = await Job.find();

    res.render("recruiterDashboard",{jobs});

});


app.get("/jobseeker/dashboard", async (req,res)=>{

    const jobs = await Job.find();

    res.render("jobseekerDashboard",{jobs});

});

app.get("/job-listing", async (req,res)=>{

    const jobs = await Job.find();

    res.render("jobListing",{jobs});

});



app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});