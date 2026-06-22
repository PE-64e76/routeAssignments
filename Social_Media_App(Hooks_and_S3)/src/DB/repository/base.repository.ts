import { AnyKeys, CreateOptions, FlattenMaps, HydratedDocument, Model, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, ReturnsNewDoc, Types, UpdateQuery, UpdateResult, UpdateWithAggregationPipeline } from "mongoose";
import { UpdateOptions } from "mongodb";

export abstract class BaseRepository<TRawDoc> {

    constructor(protected readonly model: Model<TRawDoc>) { }

    async create({
        data,
        options
    }: { data: AnyKeys<TRawDoc>[], options?: CreateOptions; }): Promise<HydratedDocument<TRawDoc>[]> {
        return await this.model.create(data as any, options);
    }

    async insetMany({
        data,
    }: {
        data: AnyKeys<TRawDoc>[],
    }): Promise<HydratedDocument<TRawDoc>[]> {
        return await this.model.insertMany(data as any) as HydratedDocument<TRawDoc>[];
    }

    async createOne({
        data,
        options = {}
    }: {
        data: AnyKeys<TRawDoc>,
        options?: CreateOptions | undefined;
    }): Promise<HydratedDocument<TRawDoc>> {
        const [user] = await this.create({ data: [data], options: options }) || [];
        return user as HydratedDocument<TRawDoc>;
    }



    // FindOne
    async findOne({
        filter,
        projection,
        options
    }: {
        filter: QueryFilter<TRawDoc>,
        projection?: ProjectionType<TRawDoc> | null | undefined,
        options?: QueryOptions<TRawDoc> & { lean: false; };
    }): Promise<HydratedDocument<TRawDoc> | null>;


    async findOne({
        filter,
        projection,
        options
    }: {
        filter: QueryFilter<TRawDoc>,
        projection?: ProjectionType<TRawDoc> | null | undefined,
        options?: QueryOptions<TRawDoc> & { lean: true; };
    }): Promise<FlattenMaps<TRawDoc> | null>;


    async findOne({
        filter = {},
        projection,
        options
    }: {
        filter: QueryFilter<TRawDoc>,
        projection?: ProjectionType<TRawDoc> | null | undefined,
        options?: QueryOptions<TRawDoc>;
    }): Promise<FlattenMaps<TRawDoc> | HydratedDocument<TRawDoc> | null | any> {
        const query = this.model.findOne(filter, projection);
        if (options?.populate) { query.populate(options.populate as PopulateOptions[]); }
        if (options?.lean !== undefined) { query.lean(options.lean); }
        return await query.exec();
    }


    async find({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDoc>,
        projection?: ProjectionType<TRawDoc> | null | undefined,
        options?: QueryOptions<TRawDoc> | null | undefined;
    }): Promise<HydratedDocument<TRawDoc>[]> {
        const doc = this.model.find(filter, projection);
        if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
        if (options?.lean) doc.lean(options.lean);
        return await doc.exec();
    }


    // Find by ID
    async findById({
        _id,
        projection,
        options
    }: {
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRawDoc> | null | undefined,
        options?: QueryOptions<TRawDoc> & { lean: false; } | null | undefined,
    }): Promise<HydratedDocument<TRawDoc> | null>;

    async findById({
        _id,
        projection,
        options
    }: {
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRawDoc> | null | undefined,
        options?: QueryOptions<TRawDoc> & { lean: true; } | null | undefined,
    }): Promise<null | FlattenMaps<TRawDoc>>;

    async findById({
        _id,
        projection,
        options
    }: {
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRawDoc> | null | undefined,
        options?: QueryOptions<TRawDoc> | null | undefined,
    }): Promise<HydratedDocument<TRawDoc> | FlattenMaps<TRawDoc> | null> {
        const doc = this.model.findById(_id, projection);
        if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
        if (options?.lean) doc.lean(options.lean);
        return await doc.exec();
    }

    // Update
    async findOneAndUpdate({
        filter,
        update,
        options = { new: true }
    }: {
        filter: QueryFilter<TRawDoc>,
        update: UpdateQuery<TRawDoc>,
        options?: QueryOptions<TRawDoc> & ReturnsNewDoc,
    }): Promise<HydratedDocument<TRawDoc> | null> {
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options);
    };

    async findByIdAndUpdate({
        _id,
        update,
        options = { new: true }
    }: {
        _id: Types.ObjectId,
        update: UpdateQuery<TRawDoc>,
        options: QueryOptions<TRawDoc> & ReturnsNewDoc,
    }): Promise<HydratedDocument<TRawDoc> | null> {
        return await this.model.findByIdAndUpdate(_id, { ...update, $inc: { __v: 1 } }, options);
    };

    async updateOne({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<TRawDoc>,
        update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline,
        options?: UpdateOptions | null;
    }): Promise<UpdateResult> {
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }

    async updateMany({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<TRawDoc>,
        update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline,
        options?: UpdateOptions | null;
    }): Promise<UpdateResult> {
        return await this.model.updateMany(filter, update, options);
    }

}

