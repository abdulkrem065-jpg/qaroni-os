import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { NumberSequenceId } from '../valueobjects/NumberSequenceId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { SequencePrefix } from '../valueobjects/SequencePrefix';
import { SequencePattern } from '../valueobjects/SequencePattern';
import { NumberSequenceCreatedEvent, NumberGeneratedEvent } from '../events/SettingsEvents';

export class NumberSequence extends AggregateRoot<NumberSequenceId> {
    private constructor(
        id: NumberSequenceId,
        private _organizationId: OrganizationId,
        private _entityType: string,
        private _prefix: SequencePrefix,
        private _pattern: SequencePattern,
        private _currentValue: number,
        private _createdAt: Date
    ) {
        super(id);
    }

    public static create(id: NumberSequenceId, organizationId: OrganizationId, entityType: string, prefix: SequencePrefix, pattern: SequencePattern): NumberSequence {
        const s = new NumberSequence(id, organizationId, entityType, prefix, pattern, 0, new Date());
        s.addDomainEvent(new NumberSequenceCreatedEvent(id.value, organizationId));
        return s;
    }

    public static load(id: NumberSequenceId, organizationId: OrganizationId, entityType: string, prefix: SequencePrefix, pattern: SequencePattern, currentValue: number, createdAt: Date): NumberSequence {
        return new NumberSequence(id, organizationId, entityType, prefix, pattern, currentValue, createdAt);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get entityType(): string { return this._entityType; }
    public get prefix(): SequencePrefix { return this._prefix; }
    public get pattern(): SequencePattern { return this._pattern; }
    public get currentValue(): number { return this._currentValue; }
    public get createdAt(): Date { return this._createdAt; }

    public generateNext(): string {
        this._currentValue += 1;
        const valStr = this._currentValue.toString();
        // naive pattern replacement for '#'
        const padLen = (this._pattern.value.match(/#/g) || []).length;
        const paddedVal = valStr.padStart(padLen, '0');
        const result = `${this._prefix.value}${paddedVal}`;
        
        this.addDomainEvent(new NumberGeneratedEvent(this.id.value, this._organizationId, result));
        return result;
    }
}
