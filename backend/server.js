const express = require("express");
const client = require("prom-client");

// Enable default system metrics
client.collectDefaultMetrics();

// Create registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const mysql = require("mysql2/promise");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

/* =======================
   Database Connection
======================= */

const db = mysql.createPool({
  host: process.env.DB_HOST,       // db
  user: process.env.DB_USER,       // schooluser
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("SIGINT", async () => {
  await db.end();
  process.exit();
});

/* =======================
   Helper Functions
======================= */

const getLastStudentID = async () => {
  const [result] = await db.query("SELECT MAX(id) AS lastID FROM student");
  return result[0].lastID || 0;
};

const getLastTeacherID = async () => {
  const [result] = await db.query("SELECT MAX(id) AS lastID FROM teacher");
  return result[0].lastID || 0;
};

/* =======================
   Routes (API)
======================= */

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

app.get("/api/student", async (req, res) => {
  const [data] = await db.query("SELECT * FROM student");
  res.json(data);
});

app.get("/api/teacher", async (req, res) => {
  const [data] = await db.query("SELECT * FROM teacher");
  res.json(data);
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});


app.post("/api/addstudent", async (req, res) => {
  try {
    const nextID = (await getLastStudentID()) + 1;

    const sql =
      "INSERT INTO student (id, name, roll_number, class) VALUES (?, ?, ?, ?)";

    await db.query(sql, [
      nextID,
      req.body.name,
      req.body.rollNo,
      req.body.class
    ]);

    res.json({ message: "Student added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add student" });
  }
});

app.post("/api/addteacher", async (req, res) => {
  try {
    const nextID = (await getLastTeacherID()) + 1;

    const sql =
      "INSERT INTO teacher (id, name, subject, class) VALUES (?, ?, ?, ?)";

    await db.query(sql, [
      nextID,
      req.body.name,
      req.body.subject,
      req.body.class
    ]);

    res.json({ message: "Teacher added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add teacher" });
  }
});

app.delete("/api/student/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    await db.query("DELETE FROM student WHERE id = ?", [studentId]);

    const [rows] = await db.query("SELECT id FROM student ORDER BY id");

    for (let i = 0; i < rows.length; i++) {
      await db.query("UPDATE student SET id = ? WHERE id = ?", [
        i + 1,
        rows[i].id
      ]);
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

app.delete("/api/teacher/:id", async (req, res) => {
  const teacherId = req.params.id;

  try {
    await db.query("DELETE FROM teacher WHERE id = ?", [teacherId]);

    const [rows] = await db.query("SELECT id FROM teacher ORDER BY id");

    for (let i = 0; i < rows.length; i++) {
      await db.query("UPDATE teacher SET id = ? WHERE id = ?", [
        i + 1,
        rows[i].id
      ]);
    }

    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

/* =======================
   Start Server
======================= */

app.listen(3500, "0.0.0.0" , () => {
  console.log("Backend running on port 3500");
});

