var BROWN = "\033[33m",
    GREEN = "\033[32m",
    RESET = "\033[0m",

    express   = require("express"),
    fs        = require("fs"),

    io        = require("socket.io"),

    _         = require("underscore"),
    Mustache  = require("mustache"),

    app       = express.createServer(),
    staticDir = express.static,

    options = {
      port : 1947,
      baseDir : __dirname + "/../../"
    },

    slidesLocation = "http://localhost" + (options.port ? (":" + options.port) : "");

io = io.listen(app);

io.sockets.on("connection", function(socket) {
  socket.on("slideChanged", function(slideData) {
    socket.broadcast.emit("slideData", slideData);
  });

  socket.on("fragmentChanged", function(fragmentData) {
    socket.broadcast.emit("fragmentData", fragmentData);
  });

  socket.on("nextSlide", function() {
    socket.broadcast.emit("nextSlide");
  });

  socket.on("prevSlide", function() {
    socket.broadcast.emit("prevSlide");
  });

  socket.on("initialSlide", function() {
    socket.broadcast.emit("initialSlide");
  });

  socket.on("initialSlideReceived", function(data) {
    socket.broadcast.emit("initialSlideReceived", data);
  });
});

app.configure(function() {
  [ "css", "js", "images", "plugin", "lib" ].forEach(function(dir) {
    app.use("/" + dir, staticDir(options.baseDir + dir));
  });
});

app.get("/", function(req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  fs.createReadStream(options.baseDir + "/index.html").pipe(res);
});

app.get("/notes/:socketId", function(req, res) {
  fs.readFile(options.baseDir + "plugin/notes-server/notes.html", function(err, data) {
    res.send(Mustache.to_html(data.toString(), {
      socketId : req.params.socketId
    }));
  });
});

app.listen(options.port || null);

console.log(BROWN + "reveal.js - Speaker Notes" + RESET);

console.log("1. Open the slides at " + GREEN + slidesLocation + RESET);
console.log("2. Click on the link your JS console to go to the notes page");
console.log("3. Advance through your slides and your notes will advance automatically");