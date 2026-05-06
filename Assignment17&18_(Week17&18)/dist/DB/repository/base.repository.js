"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options }) {
        return await this.model.create(data, options);
    }
    async createOne({ data, options = {} }) {
        const [user] = await this.create({ data: [data], options: options }) || [];
        return user;
    }
    async findOne({ filter = {}, projection, options }) {
        const query = this.model.findOne(filter, projection);
        if (options?.populate) {
            query.populate(options.populate);
        }
        if (options?.lean !== undefined) {
            query.lean(options.lean);
        }
        return await query.exec();
    }
}
exports.BaseRepository = BaseRepository;
