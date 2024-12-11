import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "abdulmalik99",
  database: "google_form_clone",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
