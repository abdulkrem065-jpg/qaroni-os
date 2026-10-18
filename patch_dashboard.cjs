const fs = require('fs');
let content = fs.readFileSync('src/admin/Dashboard.tsx', 'utf-8');

// Replace staffMock
content = content.replace(
    "const staffMock = SupabaseServerlessDB.getStaff();\n      setStaffList(staffMock);",
    "try { const res = await fetch('/api/staff'); if (res.ok) setStaffList(await res.json()); } catch (e) { console.error(e); }"
);

// Replace debt mock logic
content = content.replace(
    "const mockDebtId = `debt-${Date.now()}`;",
    "const mockDebtId = crypto.randomUUID ? crypto.randomUUID() : `debt-${Date.now()}`;"
);

// Remove simulation button block
const buttonRegex = /\{\/\* Option B: Fast trial simulation \*\/\}[\s\S]*?<\/button>/;
content = content.replace(buttonRegex, "");

fs.writeFileSync('src/admin/Dashboard.tsx', content);
