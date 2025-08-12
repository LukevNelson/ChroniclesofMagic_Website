import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const ADMIN_USER = "admin";
const ADMIN_HASHED_PASSWORD = bcrypt.hashSync("YSP", 10); // Store this securely
const JWT_SECRET = "yourJWTSecret";

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && bcrypt.compareSync(password, ADMIN_HASHED_PASSWORD)) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Protected delete endpoint
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

document.getElementById('loginBtn').onclick = async function() {
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;
  const res = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (res.ok) {
    const { token } = await res.json();
    localStorage.setItem('authToken', token);
    alert("Login successful!");
    fetchProfiles();
  } else {
    alert("Login failed.");
  }
};

async function fetchProfiles() {
  const res = await fetch('http://localhost:3000/api/profiles');
  const profiles = await res.json();
  const table = document.getElementById('profileTable');
  const token = localStorage.getItem('authToken');

  table.innerHTML = `
    <tr>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Age</th>
      <th>Taken Name</th>
      <th>Magical Discipline</th>
      <th>Species</th>
      <th>Delete</th>
    </tr>
  `;
  profiles.forEach(profile => {
    table.innerHTML += `
      <tr>
        <td>${profile.firstName}</td>
        <td>${profile.lastName}</td>
        <td>${profile.age}</td>
        <td>${profile.takenName}</td>
        <td>${profile.discipline}</td>
        <td>${profile.species}</td>
        <td>
          ${token ? `<button onclick="deleteProfile(${profile.id})">Delete</button>` : ''}
        </td>
      </tr>
    `;
  });
}

window.deleteProfile = async function(id) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert("You must be logged in as admin to delete.");
    return;
  }
  const res = await fetch(`http://localhost:3000/api/profiles/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (res.ok) {
    fetchProfiles();
  } else {
    alert("Delete failed: Unauthorized or server error.");
  }
};

fetchProfiles();