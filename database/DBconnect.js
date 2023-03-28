const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://testmailpush2:Hello123@cluster0.bilvv1r.mongodb.net/waterinsight?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log(error));
