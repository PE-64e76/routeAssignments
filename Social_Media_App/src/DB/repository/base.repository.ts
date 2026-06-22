import { AnyKeys, CreateOptions, FlattenMaps, HydratedDocument, Model, mongo, PipelineStage, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, ReturnsNewDoc, Types, UpdateQuery, UpdateResult, UpdateWithAggregationPipeline } from "mongoose";

type UpdateOptions = mongo.UpdateOptions;
import { IPaginate } from "../../common/interfaces";

export abstract class BaseRepository<TRawDocument> {

    constructor(protected readonly model: Model<TRawDocument>) { }

    async create({
        data,
        options
    }: { data: AnyKeys<TRawDocument>[], options?: CreateOptions; }): Promise<HydratedDocument<TRawDocument>[]> {
        return await this.model.create(data as any, options);
    }

    async insetMany({
        data,
    }: {
        data: AnyKeys<TRawDocument>[],
    }): Promise<HydratedDocument<TRawDocument>[]> {
        return await this.model.insertMany(data as any) as HydratedDocument<TRawDocument>[];
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



    // FindOne
    async findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean?: false; } | null | undefined;
    }): Promise<HydratedDocument<TRawDocument> | null>;
    async findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean?: true; } | null | undefined;
    }): Promise<FlattenMaps<TRawDocument> | null>;
    async findOne({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> | null | undefined;
    }): Promise<HydratedDocument<TRawDocument> | FlattenMaps<TRawDocument> | null> {
        const doc = this.model.findOne(filter, projection);
        if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
        if (options?.lean) doc.lean(options.lean);
        return await doc.exec();
    }


    async find({
        filter,
        projection,
        options
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> | null | undefined;
    }): Promise<HydratedDocument<TRawDocument>[]> {
        const doc = this.model.find(filter, projection);
        if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
        if (options?.sort) doc.sort(options.sort);
        if (options?.skip != null) doc.skip(options.skip);
        if (options?.limit != null) doc.limit(options.limit);
        // if (options?.lean) doc.lean(options.lean);
        return await doc.exec();
    }


    async count({
        filter
    }: {
        filter?: QueryFilter<TRawDocument>;
    }): Promise<number> {
        return await this.model.countDocuments(filter || {});
    }

    async aggregate<TResult = any>({
        pipeline
    }: {
        pipeline: PipelineStage[];
    }): Promise<TResult[]> {
        return await this.model.aggregate<TResult>(pipeline);
    }


    async paginate({
        filter,
        projection,
        options = {},
        page = 1,
        size = 5
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument>,
        page?: number | string | undefined,
        size?: number | string | undefined,
    }): Promise<IPaginate<TRawDocument>> {

        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(size) || 5);

        options.skip = (currentPage - 1) * pageSize;
        options.limit = pageSize;

        const count = await this.model.countDocuments(filter || {});
        const docs = await this.find({ filter: filter || {}, projection, options });

        return {
            docs,
            currentPage,
            size: pageSize,
            pages: count > 0 ? Math.ceil(count / pageSize) : 0,
        };

    }


    // Find by ID
    async findById({
        _id,
        projection,
        options
    }: {
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: false; } | null | undefined,
    }): Promise<HydratedDocument<TRawDocument> | null>;

    async findById({
        _id,
        projection,
        options
    }: {
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: true; } | null | undefined,
    }): Promise<null | FlattenMaps<TRawDocument>>;

    async findById({
        _id,
        projection,
        options
    }: {
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> | null | undefined,
    }): Promise<HydratedDocument<TRawDocument> | FlattenMaps<TRawDocument> | null> {
        const doc = this.model.findById(_id, projection);
        if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
        if (options?.lean) doc.lean(options.lean);
        return await doc.exec();
    }

    // Update
    async findOneAndUpdate({
        filter,
        update,
        options = { new: true },
        populate = []
    }: {
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument>,
        options?: QueryOptions<TRawDocument> & ReturnsNewDoc,
        populate?: PopulateOptions[];
    }): Promise<HydratedDocument<TRawDocument> | null> {
        if (Array.isArray(update)) {
            update.push({ $set: { __v: { $add: ["$__v", 1] } } });
            return await this.model.findOneAndUpdate(filter, update, { ...options, updatePipeline: true }).populate(populate);
        }
        return await this.model.findOneAndUpdate(filter, update, { ...options, $incr: { __v: 1 } }).populate(populate);
    };

    async findByIdAndUpdate({
        _id,
        update,
        options = { new: true }
    }: {
        _id: Types.ObjectId,
        update: UpdateQuery<TRawDocument>,
        options: QueryOptions<TRawDocument> & ReturnsNewDoc,
    }): Promise<HydratedDocument<TRawDocument> | null> {
        return await this.model.findByIdAndUpdate(_id, { ...update, $inc: { __v: 1 } }, options);
    };

    async updateOne({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
        options?: UpdateOptions | null;
    }): Promise<UpdateResult> {
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options as any);
    }

    async updateMany({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
        options?: UpdateOptions | null;
    }): Promise<UpdateResult> {
        return await this.model.updateMany(filter, update, options as any);
    }

    // Delete
    async deleteOne({
        filter,
        force = false
    }: {
        filter: QueryFilter<TRawDocument>,
        force?: boolean;
    }): Promise<{ deletedCount: number; }> {
        if (!force) {
            const result = await this.model.updateOne({ ...filter, deletedAt: { $exists: false } }, { deletedAt: new Date() });
            return { deletedCount: result.modifiedCount ?? 0 };
        }
        const result = await this.model.deleteOne({ ...filter, force: true });
        return { deletedCount: result.deletedCount ?? 0 };
    }

    async deleteMany({
        filter,
        force = false
    }: {
        filter: QueryFilter<TRawDocument>,
        force?: boolean;
    }): Promise<{ deletedCount: number; }> {
        if (!force) {
            const result = await this.model.updateMany({ ...filter, deletedAt: { $exists: false } }, { deletedAt: new Date() });
            return { deletedCount: result.modifiedCount ?? 0 };
        }
        const result = await this.model.deleteMany({ ...filter, force: true });
        return { deletedCount: result.deletedCount ?? 0 };
    }

    async restoreOne({
        filter
    }: {
        filter: QueryFilter<TRawDocument>;
    }): Promise<UpdateResult> {
        return await this.model.updateOne(
            { ...filter, paranoid: false, deletedAt: { $exists: true } },
            { restoredAt: new Date() }
        );
    }

}