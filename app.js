const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
// Mongo URI
const mongoURI = 'mongodb://brad:tanatip1996@ds021343.mlab.com:21343/shopping';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);
var i;
// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('index', { files: files });
    }
  });
});

app.get('/home', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('home', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('home', { files: files });
    }
  });
});

app.get('/productinfo',(req,res)=>{
  res.render('productinfo')
})

app.get('/management',(req,res)=>{
  res.render('management')
})

app.get('/shop',(req,res)=>{
  res.render('shop')
})

app.get('/register',(req,res)=>{
  res.render('register')
})

app.get('/registerSeller',(req,res)=>{
  res.render('registerSeller')
})

app.get('/signin',(req,res)=>{
  res.render('signin')
})

app.get('/cart',(req,res)=>{
  res.render('cart')
})

app.get('/wishlist',(req,res)=>{
  res.render('wishlist')
})

app.get('/productlist',(req,res)=>{
  res.render('productlist')
})

app.get('/productinfo1',(req,res)=>{
  res.render('productinfo1')
})

app.get('/productinfo2',(req,res)=>{
  res.render('productinfo2')
})

app.get('/productinfo3',(req,res)=>{
  res.render('productinfo3')
})

app.get('/productinfo4',(req,res)=>{
  res.render('productinfo4')
})

app.get('/productinfo5',(req,res)=>{
  res.render('productinfo5')
})
// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.redirect('/');
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /image/:id
// @desc Display Image
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename:req.params.filename }, (err, file) => {
    if (err) throw err
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});


const port = 8080;

app.listen(port, () => console.log(`Server started on port ${port}`));
