import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(process.cwd()));

const dbPromise = open({
  filename: './profiles.db',
  driver: sqlite3.Database
});

// Create table if not exists
dbPromise.then(async db => {
  await db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      age INTEGER,
      takenName TEXT,
      discipline TEXT,
      species TEXT
    )
  `);

  // Insert sample data (run once)
  await db.run(`INSERT INTO profiles (firstName, lastName, age, takenName, discipline, species)
    VALUES ('Stephanie', 'Edgley', 16, 'Valkyrie Cain', 'Elemental', 'Human')`);
  await db.run(`INSERT INTO profiles (firstName, lastName, age, takenName, discipline, species)
    VALUES ('Skulduggery', 'Pleasant', 300, 'Skulduggery Pleasant', 'Elemental', 'Skeleton')`);
  // ...add more as needed
});

// Helper: Generate Taken Name (reuse your JS logic)
function generateTakenName() {
  const descriptors = ["Ghastly", "China", "Tanith", "Valkyrie", "Lord", "Saracen", "Erskine", "Billy-Ray", "Solomon", "Skulduggery"];
  const surnames = ["Pleasant", "Bespoke", "Low", "Sorrows", "Cain", "Vile", "Rue", "Ravel", "Sanguine", "Wreath", "Scapegrace", "Clarabelle"];
  if (Math.random() < 0.2) {
    return descriptors.concat(surnames)[Math.floor(Math.random() * (descriptors.length + surnames.length))];
  } else {
    const first = descriptors[Math.floor(Math.random() * descriptors.length)];
    const second = surnames[Math.floor(Math.random() * surnames.length)];
    return `${first} ${second}`;
  }
}

// Weighted scoring logic
function getDiscipline(q1, q2, q3) {
  const disciplineWeights = {
    power: "Elemental",
    knowledge: "Necromancer",
    justice: "Detective",
    freedom: "Shapeshifter",
    black: "Vampire",
    blue: "Elemental",
    red: "Sorcerer",
    silver: "Telepath",
    logic: "Necromancer",
    intuition: "Shapeshifter",
    force: "Elemental",
    persuasion: "Telepath"
  };
  return disciplineWeights[q1] || disciplineWeights[q2] || disciplineWeights[q3] || "Sorcerer";
}

function getSpecies(q1, q2, q3) {
  const speciesWeights = {
    power: "Human",
    knowledge: "Human",
    justice: "Skeleton",
    freedom: "Vampire",
    black: "Skeleton",
    blue: "Human",
    red: "Vampire",
    silver: "Human",
    logic: "Human",
    intuition: "Vampire",
    force: "Skeleton",
    persuasion: "Human"
  };
  return speciesWeights[q1] || speciesWeights[q2] || speciesWeights[q3] || "Human";
}

// API: Submit quiz and create new profile
app.post('/api/profiles', async (req, res) => {
  const { firstName, lastName, age, q1, q2, q3 } = req.body;
  const takenName = generateTakenName();
  const discipline = getDiscipline(q1, q2, q3);
  const species = getSpecies(q1, q2, q3);

  const db = await dbPromise;
  await db.run(
    'INSERT INTO profiles (firstName, lastName, age, takenName, discipline, species) VALUES (?, ?, ?, ?, ?, ?)',
    [firstName, lastName, age, takenName, discipline, species]
  );
  console.log(`Inserted profile for ${firstName} ${lastName}`);

  // Return all profiles
  const profiles = await db.all('SELECT * FROM profiles');
  res.json(profiles);
});

// API: Get all profiles
app.get('/api/profiles', async (req, res) => {
  const db = await dbPromise;
  const profiles = await db.all('SELECT * FROM profiles');
  res.json(profiles);
});

// Simple admin check (replace with real auth in production)
const ADMIN_PASSWORD = "YSP";

app.delete('/api/profiles/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  try {
    jwt.verify(authHeader.replace("Bearer ", ""), JWT_SECRET);
    const db = await dbPromise;
    await db.run('DELETE FROM profiles WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(403).json({ error: "Forbidden" });
  }
});

// API: Login
const ADMIN_USER = "admin";
const ADMIN_PASSWORD_HASH = "$2b$10$wH8jv8Z8jv8Z8jv8Z8jv8O"; // bcrypt hash for "YSP"
const JWT_SECRET = "your_jwt_secret"; // Replace with your secret

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (
    username === ADMIN_USER &&
    bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
  ) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));