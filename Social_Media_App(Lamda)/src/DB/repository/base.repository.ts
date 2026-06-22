import { AnyKeys, CreateOptions, FlattenMaps, HydratedDocument, Model, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, ReturnsNewDoc, Types, UpdateQuery, UpdateResult, UpdateWithAggregationPipeline } from "mongoose";
import { UpdateOptions } from "mongodb";
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
        if (options?.skip) doc.skip(options.skip);
        if (options?.limit) doc.limit(options.limit);
        // if (options?.lean) doc.lean(options.lean);
        return await doc.exec();
    }


    async paginate({
        filter,
        projection,
        options = {},
        page = 0,
        size = 5
    }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument>,
        page?: number | string | undefined,
        size?: number | string | undefined,
    }): Promise<IPaginate<TRawDocument>> {

        let count: number = -1;
        if (Number(page) > 0) {
            page = parseInt(page as string);
            size = parseInt(size as string);
            options.skip = (page - 1) * size;
            options.limit = size;
            count = await this.model.countDocuments({ filter });
        }
        const docs = await this.find({ filter: filter || {}, projection, options });
        return {
            docs,
            ...(Number(page) > 0 ? {
                currentPage: page,
                size,
                pages: Math.ceil(count / parseInt(size as string))
            } : {})
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
        options = { new: true }
    }: {
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument>,
        options?: QueryOptions<TRawDocument> & ReturnsNewDoc,
    }): Promise<HydratedDocument<TRawDocument> | null> {
        if (Array.isArray(update)) {
            update.push({ $set: { __v: { $add: ["$__v", 1] } } });
            return await this.model.findOneAndUpdate(filter, update, { ...options, updatePipeline: true });
        }
        return await this.model.findOneAndUpdate(filter, update, { ...options, $incr: { __v: 1 } });
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
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
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
        return await this.model.updateMany(filter, update, options);
    }

}

