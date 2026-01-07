const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "flight_booking"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("MySQL Connected");
  
  // Ensure bookings table has the correct structure
  ensureBookingsTableStructure();
});

// Function to ensure bookings table has all required columns
function ensureBookingsTableStructure() {
  const columnsToAdd = [
    { name: 'booking_date', sql: 'ALTER TABLE bookings ADD COLUMN booking_date DATE AFTER destination' },
    { name: 'passenger_name', sql: 'ALTER TABLE bookings ADD COLUMN passenger_name VARCHAR(100) AFTER price' },
    { name: 'passenger_age', sql: 'ALTER TABLE bookings ADD COLUMN passenger_age INT AFTER passenger_name' },
    { name: 'seat_number', sql: 'ALTER TABLE bookings ADD COLUMN seat_number VARCHAR(10) AFTER passenger_age' },
    { name: 'created_at', sql: 'ALTER TABLE bookings ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER seat_number' }
  ];
  
  // Check which columns exist
  db.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'flight_booking' AND TABLE_NAME = 'bookings'",
    (err, existingColumns) => {
      if (err) {
        console.error("Error checking table structure:", err);
        return;
      }
      
      const existingColumnNames = existingColumns.map(col => col.COLUMN_NAME);
      const missingColumns = columnsToAdd.filter(col => !existingColumnNames.includes(col.name));
      
      if (missingColumns.length > 0) {
        console.log(`Adding ${missingColumns.length} missing column(s) to bookings table...`);
        
        let completed = 0;
        missingColumns.forEach(col => {
          db.query(col.sql, (err) => {
            if (err) {
              if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`Column ${col.name} already exists`);
              } else {
                console.error(`Error adding column ${col.name}:`, err.message);
              }
            } else {
              console.log(`Added column: ${col.name}`);
            }
            completed++;
            if (completed === missingColumns.length) {
              console.log("Bookings table structure check complete");
            }
          });
        });
      } else {
        console.log("Bookings table structure is up to date");
      }
    }
  );
}

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);

/* REGISTER */
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }
  db.query(
    "INSERT INTO users (name, email, password) VALUES (?,?,?)",
    [name, email, password],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.json({ success: false, message: "Email already exists" });
        }
        return res.json({ success: false, message: "Registration failed" });
      }
      res.json({ success: true, message: "Registered successfully" });
    }
  );
});

/* LOGIN */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Email and password required" });
  }
  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, r) => {
      if (err) {
        return res.json({ success: false, message: "Login failed" });
      }
      res.json({
        success: r.length > 0,
        message: r.length > 0 ? "Login successful" : "Invalid credentials",
        user: r.length > 0 ? { name: r[0].name, email: r[0].email } : null
      });
    }
  );
});

/* FLIGHTS */
app.get("/api/flights", (req, res) => {
  const { source, destination } = req.query;
  if (!source || !destination) {
    return res.json([]);
  }
  db.query(
    "SELECT * FROM flights WHERE LOWER(source)=LOWER(?) AND LOWER(destination)=LOWER(?)",
    [source, destination],
    (err, r) => {
      if (err) {
        return res.json([]);
      }
      res.json(r);
    }
  );
});

/* GET ALL FLIGHTS */
app.get("/api/all-flights", (req, res) => {
  db.query("SELECT * FROM flights", (err, r) => {
    if (err) {
      return res.json([]);
    }
    res.json(r);
  });
});

/* BOOK */
app.post("/book", (req, res) => {
  const b = req.body;
  if (!b.email || !b.flight_name || !b.source || !b.destination || !b.passengers || !b.price) {
    return res.json({ success: false, message: "Missing required fields" });
  }
  
  // Ensure we always have a valid date
  let bookingDate = b.date;
  if (!bookingDate || bookingDate === 'Invalid Date') {
    bookingDate = new Date().toISOString().slice(0, 10);
  }
  
  // Ensure date is in YYYY-MM-DD format
  if (bookingDate && bookingDate.length === 10 && bookingDate.includes('-')) {
    // Date is already in correct format
  } else {
    bookingDate = new Date().toISOString().slice(0, 10);
  }
  
  db.query(
    "INSERT INTO bookings (user_email, flight_name, source, destination, booking_date, passengers, price, passenger_name, passenger_age, seat_number) VALUES (?,?,?,?,?,?,?,?,?,?)",
    [
      b.email, 
      b.flight_name, 
      b.source, 
      b.destination, 
      bookingDate, 
      b.passengers, 
      b.price, 
      (b.passenger_name && b.passenger_name.trim()) ? b.passenger_name.trim() : '', 
      (b.passenger_age && !isNaN(b.passenger_age)) ? parseInt(b.passenger_age) : null, 
      (b.seat_number && b.seat_number.toString().trim()) ? b.seat_number.toString().trim() : ''
    ],
    (err) => {
      if (err) {
        console.error("Booking error:", err);
        return res.json({ success: false, message: "Booking failed: " + err.message });
      }
      res.json({ success: true, message: "Booking confirmed" });
    }
  );
});

/* MY BOOKINGS */
app.get("/my-bookings", (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.json([]);
  }
  db.query(
    "SELECT booking_id, user_email, flight_name, source, destination, COALESCE(booking_date, DATE(created_at)) as booking_date, passengers, price, passenger_name, passenger_age, seat_number, created_at FROM bookings WHERE user_email=? ORDER BY created_at DESC",
    [email],
    (err, r) => {
      if (err) {
        console.error("Error fetching bookings:", err);
        return res.json([]);
      }
      res.json(r);
    }
  );
});

app.listen(5000, () =>
  console.log("Server running at http://localhost:5000")
);