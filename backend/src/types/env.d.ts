declare namespace NodeJS {
    interface ProcessEnv {
        REDIS_URL: string;
        REDIS_HOST: string;
        REDIS_PORT: string;
        REDIS_PASSWORD: string;
    }
}
