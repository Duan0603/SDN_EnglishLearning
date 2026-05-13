export const dev = {
    app: {
        port: process.env.PORT || 3017
    },
    db: process.env.DATABASE_URL
}

export const product = {
    app: {
        port: 3000
    },
    db: process.env.DATABASE_URL
}

export const env = process.env.NODE_ENV || 'dev'