import { AnyKeys, CreateOptions, FlattenMaps, HydratedDocument, Model, PopulateOptions, ProjectionType, QueryFilter, QueryOptions } from "mongoose";

export abstract class BaseRepository<TRawDocument> {

    constructor(protected readonly model: Model<TRawDocument>) { }

    async create(
        {
            data,
            options
        }: { data: AnyKeys<TRawDocument>[], options?: CreateOptions; }): Promise<HydratedDocument<TRawDocument>[]> {
        return await this.model.create(data as any, options);
    }

    async createOne({
        data,
        options = {}
    }: {
        data: AnyKeys<TRawDocument>,
        options?: CreateOptions | undefined;
    }): Promise<HydratedDocument<TRawDocument>> {
        const [user] = await this.create({ data: [data], options: options }) || [];
        return user as HydratedDocument<TRawDocument>;
    }

    async findOne({
        filter,
        projection,
        options
    }: {
        filter: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: false; };
    }): Promise<HydratedDocument<TRawDocument> | null>;


    async findOne({
        filter,
        projection,
        options
    }: {
        filter: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: true; };
    }): Promise<FlattenMaps<TRawDocument> | null>;


    async findOne({
        filter = {},
        projection,
        options
    }: {
        filter: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument>;
    }): Promise<FlattenMaps<TRawDocument> | HydratedDocument<TRawDocument> | null | any> {
        const query = this.model.findOne(filter, projection);
        if (options?.populate) { query.populate(options.populate as PopulateOptions[]); }
        if (options?.lean !== undefined) { query.lean(options.lean); }
        return await query.exec();
    }
}