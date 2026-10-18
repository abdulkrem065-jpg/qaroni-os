export interface ITransformationRule {
    sourceField: string;
    targetField: string;
    transformationType: 'DIRECT' | 'FORMAT_DATE' | 'UPPERCASE' | 'LOWERCASE' | 'CUSTOM';
    customScript?: string;
}

export interface IDataTransformer {
    transform(sourceData: any, rules: ITransformationRule[]): Promise<any>;
    validateSchema(data: any, schemaDefinition: any): Promise<boolean>;
}
