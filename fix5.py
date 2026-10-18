import re
import os

with open('src/infrastructure/persistence/supabase/iam/SupabasePermissionRepository.ts', 'r') as f:
    content = f.read()

content = content.replace("findById(id: string)", "findById(id: PermissionId)")
content = content.replace(".eq('id', id)", ".eq('id', id.value)")

content = content.replace("delete(id: string)", "delete(id: PermissionId)")

with open('src/infrastructure/persistence/supabase/iam/SupabasePermissionRepository.ts', 'w') as f:
    f.write(content)

