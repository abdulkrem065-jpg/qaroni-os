import { SupabaseClient } from '@supabase/supabase-js';
import { INumberSequenceRepository } from '../../../domain/settings/repositories/INumberSequenceRepository';
import { NumberSequence } from '../../../domain/settings/aggregates/NumberSequence';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { NumberSequenceId } from '../../../domain/settings/valueobjects/NumberSequenceId';
import { SequencePrefix } from '../../../domain/settings/valueobjects/SequencePrefix';
import { SequencePattern } from '../../../domain/settings/valueobjects/SequencePattern';

export class SupabaseNumberSequenceRepository implements INumberSequenceRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): NumberSequence {
        return NumberSequence.load(
            new NumberSequenceId(row.id),
            new OrganizationId(row.organization_id),
            row.entity_type,
            new SequencePrefix(row.prefix),
            new SequencePattern(row.pattern),
            row.current_value,
            new Date(row.created_at)
        );
    }

    private toPersistence(sequence: NumberSequence): any {
        return {
            id: sequence.id.value,
            organization_id: sequence.organizationId.value,
            entity_type: sequence.entityType,
            prefix: sequence.prefix.value,
            pattern: sequence.pattern.value,
            current_value: sequence.currentValue,
            created_at: sequence.createdAt.toISOString()
        };
    }

    public async save(sequence: NumberSequence): Promise<void> {
        const { error } = await this.supabase
            .from('number_sequences')
            .upsert(this.toPersistence(sequence))
            .eq('id', sequence.id.value)
            .eq('organization_id', sequence.organizationId.value);
        if (error) throw error;
    }

    public async findByEntityType(organizationId: OrganizationId, entityType: string): Promise<NumberSequence | null> {
        const { data, error } = await this.supabase
            .from('number_sequences')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('entity_type', entityType)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }
}
