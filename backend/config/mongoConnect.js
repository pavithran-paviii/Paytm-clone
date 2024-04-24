const mongoose = require("mongoose");

async function mongoDBConnect() {
  try {
    const connect = await mongoose.connect(
      `mongodb+srv://pavithran_paviii:${encodeURIComponent(
        process.env.MONGOCONNECTPASS
      )}@leetcode-clone.upirzre.mongodb.net/paytm?retryWrites=true&w=majority`
    );
    console.log(
      "Connected on PORT: ",
      connect?.connection?.host,
      connect?.connection.name
    );
  } catch (error) {
    console.log("Error while connecting to mongodb", error?.message);
  }
}

module.exports = mongoDBConnect;
