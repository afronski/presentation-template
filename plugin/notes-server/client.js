(function() {
  if (window.location.search.match(/receiver/gi)) {
    return;
  }

  var socket = io.connect(window.location.origin),
      socketId = Math.random().toString().slice(15);

  console.log("View slide notes at " + window.location.origin + "/notes/" + socketId);

  window.open(window.location.origin + "/notes/" + socketId, "notes-" + socketId);

  socket.on("nextSlide", function() {
    Reveal.next();
  });

  socket.on("prevSlide", function() {
    Reveal.prev();
  });

  socket.on("initialSlide", function() {
    var slide = Reveal.getCurrentSlide(),
        notesElement = slide.querySelector("aside.notes"),

        firstSlideData = {
          notes: notesElement.innerHTML,
          markdown: notesElement.getAttribute("data-markdown") === "string"
        };

    socket.emit("initialSlideReceived", firstSlideData);
  })

  Reveal.addEventListener("fragmentshown", function(event) {
    var fragmentData = {
      fragment : "next",
      socketId : socketId
    };

    socket.emit("fragmentChanged", fragmentData);
  });

  Reveal.addEventListener("fragmenthidden", function(event) {
    var fragmentData = {
      fragment : "previous",
      socketId : socketId
    };

    socket.emit("fragmentChanged", fragmentData);
  });

  Reveal.addEventListener("slidechanged", function(event) {
    var nextIndexH,
        nextIndexV,

        slideElement = event.currentSlide,
        notes = slideElement.querySelector("aside.notes"),

        slideData = {
          notes : notes ? notes.innerHTML : "",

          indexH : event.indexh,
          indexV : event.indexv,

          nextindexH : nextIndexH,
          nextindexV : nextIndexV,

          socketId : socketId,
          markdown : notes ? typeof(notes.getAttribute("data-markdown")) === "string" : false
        };

    if (slideElement.nextElementSibling && slideElement.parentNode.nodeName == "SECTION") {
      nextIndexH = event.indexh;
      nextIndexV = event.indexv + 1;
    } else {
      nextIndexH = event.indexh + 1;
      nextIndexV = 0;
    }

    socket.emit("slideChanged", slideData);
  });
} ());