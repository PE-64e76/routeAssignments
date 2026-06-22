import { IAdminDashboard } from "../../common/interfaces";
import { UserRepository, PostRepository, CommentRepository } from "../../DB/repository";

export class AdminService {
    private readonly userRepository: UserRepository;
    private readonly postRepository: PostRepository;
    private readonly commentRepository: CommentRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.postRepository = new PostRepository();
        this.commentRepository = new CommentRepository();
    }

    async dashboard(): Promise<IAdminDashboard> {

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const usersCount = await this.userRepository.count({ filter: {} });
        const postsCount = await this.postRepository.count({ filter: {} });
        const commentsCount = await this.commentRepository.count({ filter: {} });

        const newUsersThisWeek = await this.userRepository.count({
            filter: { createdAt: { $gte: oneWeekAgo } }
        });
        const newPostsThisWeek = await this.postRepository.count({
            filter: { createdAt: { $gte: oneWeekAgo } }
        });

        const deletedUsersCount = await this.userRepository.count({
            filter: { paranoid: false, deletedAt: { $exists: true } }
        });
        const deletedPostsCount = await this.postRepository.count({
            filter: { paranoid: false, deletedAt: { $exists: true } }
        });

        return {
            usersCount,
            postsCount,
            commentsCount,
            newUsersThisWeek,
            newPostsThisWeek,
            deletedUsersCount,
            deletedPostsCount
        };
    }

}

export const adminService = new AdminService();
