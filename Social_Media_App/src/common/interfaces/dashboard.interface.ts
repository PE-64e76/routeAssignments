export interface IUserDashboard {
    postsCount: number;
    commentsCount: number;
    reactionsReceived: number;
    friendsCount: number;
}

export interface IAdminDashboard {
    usersCount: number;
    postsCount: number;
    commentsCount: number;
    newUsersThisWeek: number;
    newPostsThisWeek: number;
    deletedUsersCount: number;
    deletedPostsCount: number;
}
