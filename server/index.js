import express from "express";
import  bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { register } from "./controllers/auth.js"; 
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import {createPost} from "./controllers/posts.js";
import { fileURLToPath } from "url";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

//Configurations
const __filename = fileURLToPath(import.meta.url);   //import.meta imports meta data; .url extracts url from that. fileURLToPath converts url to absolute file system path to the current file.
const __dirname = path.dirname(__filename);          // absolute file system path to the curr folder.
dotenv.config();
const app = express(); 
app.use(express.json());                                             //app.use is a middleware, a function thats intermediates between an HTTP req and the final route handler. express.json() is a middleware that looks out for the content-type in the header of every http request. If the content type is json, it will parse the jason data into req.body property
app.use(helmet());                                                   // helmet is a middleware that add security related HTTP headers into the responses sent by your application
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"})); //a specific type of sequrity measure in helmet package
app.use(morgan("common"));                                           //morgan logs informations about incoming http requests and their responses into the application. "common" is a particular log format.
app.use(bodyParser.json({limit: "30mb",extended:true}));             // parses json-encoded body of the incoming http request into req.body
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));     //parses url-encoded req bodies 
app.use(cors());                                                     //adds security related http headers; helpful in dealing with requests from other domains.
app.use("/assets", express.static(path.join(__dirname, 'public/assets'))); // sets up a middleware that for requests starting with "/assets". express.static serves static files like jpg, css, js, etc 

//File storage
const storage = multer.diskStorage({                                // multer manages file uploads
    destination: function(req, file,cb){
        cb(null,"public/assets");
    },
    filename : function(req,file,cb){
        cb(null,file.originalname);
    }
    
});
const upload = multer({storage});

//routes with files
app.post("/auth/register",upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"),createPost);

//Routes with files
app.use("/auth", authRoutes);
app.use("/users",userRoutes);
app.use("/posts", postRoutes);

//Mongoose setup
const PORT = process.env.PORT||6001;
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
.then(()=> {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    /*Add this data one time*/
    User.insertMany(users);
    Post.insertMany(posts);
})
.catch((error)=> console.log(`${error} did not connect`));