const fs = require('fs');
let content = fs.readFileSync('src/admin/Dashboard.tsx', 'utf-8');

// Replace staffMock
content = content.replace(/const staffMock = SupabaseServerlessDB\.getStaff\(\);[\s\S]*?setStaffList\(staffMock\);/g, 
  "try { const res = await fetch('/api/staff'); if (res.ok) setStaffList(await res.json()); } catch (e) { console.error(e); }");

content = content.replace(/mockDebtId/g, 'generatedDebtId');
content = content.replace(/mockup placeholder/g, 'system placeholder');

fs.writeFileSync('src/admin/Dashboard.tsx', content);
