// const mongoose = require('mongoose');

// const srvUrl = `mongodb+srv://testmailpush2:Hello123@cluster0.bilvv1r.mongodb.net/waterinsight?retryWrites=true&w=majority`;
// // Connect to the database using Mongoose
// mongoose.connect(srvUrl, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log('Connected to the database!');

//     // Check if the desired collection exists
//     mongoose.connection.db["test"].listCollections({ name: 'SatelliteData' })
//       .next((err, collinfo) => {
//         if (err) {
//           console.error(err);
//         } else if (!collinfo) {
//           console.error(`Collection ${collectionName} not found!`);
//         } else {
//           // Get a reference to the existing collection
//           const myCollection = mongoose.connection.db.collection(collectionName);

//           // Read records from the collection
//           myCollection.find({}, (err, docs) => {
//             if (err) {
//               console.error(err);
//             } else {
//               console.log(docs);
//             }
//           });
//         }

//         // Close the database connection when done
//         mongoose.connection.close();
//       });
//   })
//   .catch((err) => console.error(err));





const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://testmailpush2:Hello123@cluster0.bilvv1r.mongodb.net/waterinsight?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
    // creating collection
    const collection = client.db("waterinsight").collection("SatelliteData");
    // perform actions on the collection object
    // find all records and log them to the console
    collection.find({}).toArray(function(err, docs) {
      console.log(docs);
      // close the client connection
      client.close();
  });
    client.close();
});