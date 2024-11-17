declare namespace NodeJS {
  interface ProcessEnv {
    PORT: int;
    //
    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    //
    BCRYPT_SALT: string;
    JWT_SECRET: string;
    // 
    CORS_ORIGIN: string;
    //
    ALIYUN_ACCESS_KEY_ID: string;
    ALIYUN_ACCESS_KEY_SECRET: string;
    //
    SUPER_USER_INIT_NAME: string;
    SUPER_USER_INIT_MAIL: string;
    SUPER_USER_INIT_PASSWORD: string;
  }
}
