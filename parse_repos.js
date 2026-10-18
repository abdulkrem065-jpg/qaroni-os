import fs from 'fs';
import path from 'path';

const repoDir = 'src/infrastructure/persistence/supabase/';
const repos = [];

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('Repository.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const match = content.match(/\.from\('([^']+)'\)/);
            const table = match ? match[1] : 'UNKNOWN';
            
            // Check for organization_id mapping
            const hasOrgIdMapping = content.includes('organization_id') || content.includes('organizationId');
            const hasBranchIdMapping = content.includes('branch_id') || content.includes('branchId');
            
            repos.push({ file: fullPath, table, hasOrgIdMapping, hasBranchIdMapping });
        }
    }
}

walkDir(repoDir);
console.log(JSON.stringify(repos, null, 2));
