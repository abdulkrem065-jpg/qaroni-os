with open('src/infrastructure/persistence/supabase/iam/SupabaseUserRepository.ts', 'r') as f:
    content = f.read()

content = content.replace("new PersonName(record.username || record.email.split('@')[0])", "new PersonName(record.first_name || 'Unknown', record.last_name || 'Unknown')")
content = content.replace("username: user.name.value,", "username: user.name.fullName,\n            first_name: user.name.firstName,\n            last_name: user.name.lastName,")

with open('src/infrastructure/persistence/supabase/iam/SupabaseUserRepository.ts', 'w') as f:
    f.write(content)

