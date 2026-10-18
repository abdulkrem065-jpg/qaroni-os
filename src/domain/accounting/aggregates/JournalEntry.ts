import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { JournalEntryId } from '../valueobjects/JournalEntryId';

// This satisfies the "Implement Aggregate Roots: Journal, JournalEntry" requirement.
// However, the main logic will be in Journal aggregate as per Use Cases.
export class JournalEntry extends AggregateRoot<JournalEntryId> {
    constructor(id: JournalEntryId) {
        super(id);
    }
}
