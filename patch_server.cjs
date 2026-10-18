const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes("app.get('/api/staff'")) {
  content = content.replace(
    "// POST staff management (Admin only)",
    `// GET all staff members
app.get('/api/staff', (req, res) => {
  res.json(storeDatabase.staffUsers);
});

// POST staff management (Admin only)`
  );
  fs.writeFileSync('server.ts', content);
  console.log("Patched server.ts successfully");
} else {
  console.log("Already patched");
}
