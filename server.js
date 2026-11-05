
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Connect to MySQL using a connection pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Manisha@2026",
    database: "manisha_course_hub",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("Connected to MySQL successfully!");
    connection.release();
});

// GET: Display all courses
app.get("/courses", (req, res) => {
    db.query("SELECT * FROM courses", (err, result) => {
        if (err) {
            console.error("Error fetching courses:", err.message);
            return res.status(500).send(err.message);
        }

        res.json(result);
    });
});

// GET: Search one course
app.get("/courses/:course_id", (req, res) => {
    db.query(
        "SELECT * FROM courses WHERE course_id = ?",
        [req.params.course_id],
        (err, result) => {
            if (err) {
                console.error("Error searching course:", err.message);
                return res.status(500).send(err.message);
            }

            res.json(result);
        }
    );
});

// POST: Insert course
app.post("/courses", (req, res) => {
    const {
        course_id,
        course_name,
        department,
        semester,
        number,
        age
    } = req.body;

    if (
        course_id === undefined || course_id === "" ||
        !course_name || !department ||
        semester === undefined || semester === "" ||
        number === undefined || number === "" ||
        age === undefined || age === ""
    ) {
        return res.status(400).send("Please fill in all course fields.");
    }

    db.query(
        "INSERT INTO courses (course_id, course_name, department, semester, `number`, age) VALUES (?, ?, ?, ?, ?, ?)",
        [course_id, course_name, department, semester, number, age],
        (err) => {
            if (err) {
                console.error("Error registering course:", err.message);
                return res.status(500).send(err.message);
            }

            res.status(201).send("Course Registered Successfully!");
        }
    );
});

// PUT: Update course
app.put("/courses/:course_id", (req, res) => {
    const {
        course_name,
        department,
        semester,
        number,
        age
    } = req.body;

    db.query(
        "UPDATE courses SET course_name = ?, department = ?, semester = ?, `number` = ?, age = ? WHERE course_id = ?",
        [
            course_name,
            department,
            semester,
            number,
            age,
            req.params.course_id
        ],
        (err, result) => {
            if (err) {
                console.error("Error updating course:", err.message);
                return res.status(500).send(err.message);
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("Course Not Found");
            }

            res.send("Course Updated Successfully!");
        }
    );
});

// DELETE: Delete course
app.delete("/courses/:course_id", (req, res) => {
    db.query(
        "DELETE FROM courses WHERE course_id = ?",
        [req.params.course_id],
        (err, result) => {
            if (err) {
                console.error("Error deleting course:", err.message);
                return res.status(500).send(err.message);
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("Course Not Found");
            }

            res.send("Course Deleted Successfully!");
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
