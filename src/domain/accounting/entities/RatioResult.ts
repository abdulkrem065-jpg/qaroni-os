import { Entity } from '../../shared/core/Entity';
import { RatioId } from '../valueobjects/RatioId';
import { RatioName } from '../valueobjects/RatioName';
import { RatioValue } from '../valueobjects/RatioValue';
import { RatioBenchmark } from '../valueobjects/RatioBenchmark';
import { RatioStatus } from '../valueobjects/RatioStatus';
import { RatioCategory } from '../valueobjects/RatioCategory';

export class RatioResult extends Entity<RatioId> {
    private constructor(
        id: RatioId,
        private readonly _category: RatioCategory,
        private readonly _name: RatioName,
        private readonly _value: RatioValue,
        private readonly _benchmark: RatioBenchmark,
        private readonly _status: RatioStatus
    ) {
        super(id);
    }

    public static create(
        id: RatioId,
        category: RatioCategory,
        name: RatioName,
        value: RatioValue,
        benchmark: RatioBenchmark,
        status: RatioStatus
    ): RatioResult {
        return new RatioResult(id, category, name, value, benchmark, status);
    }

    public static load(
        id: RatioId,
        category: RatioCategory,
        name: RatioName,
        value: RatioValue,
        benchmark: RatioBenchmark,
        status: RatioStatus
    ): RatioResult {
        return new RatioResult(id, category, name, value, benchmark, status);
    }

    public get category(): RatioCategory { return this._category; }
    public get name(): RatioName { return this._name; }
    public get value(): RatioValue { return this._value; }
    public get benchmark(): RatioBenchmark { return this._benchmark; }
    public get status(): RatioStatus { return this._status; }
}
