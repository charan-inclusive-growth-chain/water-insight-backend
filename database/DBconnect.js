const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/Water-Insight-DB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log(error));
