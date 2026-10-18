with open('src/infrastructure/persistence/supabase/iam/SupabasePermissionRepository.ts', 'r') as f:
    content = f.read()

exists_method = """
    public async exists(id: PermissionId): Promise<boolean> {
        try {
            const { data, error } = await this.supabase
                .from('permissions')
                .select('id')
                .eq('id', id.value)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return false;
                throw error;
            }
            return !!data;
        } catch (error) {
            throw new RepositoryError(`Failed to check Permission existence: ${error}`, error);
        }
    }
"""

content = content.replace("public async findById", exists_method + "\n    public async findById")
with open('src/infrastructure/persistence/supabase/iam/SupabasePermissionRepository.ts', 'w') as f:
    f.write(content)

