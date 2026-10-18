with open('src/infrastructure/persistence/supabase/iam/SupabaseRoleRepository.ts', 'r') as f:
    content = f.read()

content = content.replace("record.name\n            );", "record.name,\n                record.description\n            );")
content = content.replace("name: role.name\n        };", "name: role.name,\n            description: role.description\n        };")

with open('src/infrastructure/persistence/supabase/iam/SupabaseRoleRepository.ts', 'w') as f:
    f.write(content)

