export const userShape = {
    id: true,
    name: true,
    tag: true,
    permissions: true,
    roles: {
        select: {
            id: true,
            permissions: true,
        },
    },
    verified: true,
    image: true,
    followerIds: true,
    followingIds: true,
};

export const fullUserShape = {
    ...userShape,
};

export const postShape = {
    user: { select: userShape },
    quote: {
        include: {
            user: { select: userShape },
            comments: {
                select: {
                    id: true,
                },
            },
            reposts: {
                select: {
                    id: true,
                    user: { select: userShape },
                },
            },
        },
    },
    comments: {
        select: {
            id: true,
        },
    },
    reposts: {
        select: {
            id: true,
            user: { select: userShape },
        },
    },
};
