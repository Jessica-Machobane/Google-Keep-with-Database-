

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let notesCollection;

// GET: retrieve saved notes
app.get("/api/notes", async (req, res) => {
  try {
    const notes = await notesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error retrieving notes:", error);
    res.status(500).json({ error: "Could not retrieve notes" });
  }
});

// POST: save a new note
app.post("/api/notes", async (req, res) => {
  try {
    const {
      id,
      title,
      content,
      color,
      pinned,
      archived,
      trashed
    } = req.body;

    if (
      typeof title !== "string" ||
      typeof content !== "string"
    ) {
      return res.status(400).json({
        error: "Title and content must be text"
      });
    }

    const newNote = {
      id: String(id || Date.now()),
      title,
      content,
      color: color || "default",
      pinned: Boolean(pinned),
      archived: Boolean(archived),
      trashed: Boolean(trashed),
      createdAt: new Date()
    };

    const result = await notesCollection.insertOne(newNote);

    res.status(201).json({
      message: "Note saved successfully",
      note: {
        ...newNote,
        _id: result.insertedId
      }
    });

  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ error: "Could not save note" });
  }
});

// Connect to MongoDB, then start the server
async function startServer() {
  try {
    await client.connect();

    const database = client.db("google_keep");
    notesCollection = database.collection("notes");

    app.listen(process.env.PORT || 3000, () => {
      console.log("Server running on http://localhost:3000");
    });

  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

startServer();
