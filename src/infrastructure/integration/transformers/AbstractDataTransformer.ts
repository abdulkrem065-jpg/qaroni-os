import { IDataTransformer, ITransformationRule } from '../../../domain/integration/ports/IDataTransformer';

export abstract class AbstractDataTransformer implements IDataTransformer {
    public abstract transform(sourceData: any, rules: ITransformationRule[]): Promise<any>;
    public abstract validateSchema(data: any, schemaDefinition: any): Promise<boolean>;
}
