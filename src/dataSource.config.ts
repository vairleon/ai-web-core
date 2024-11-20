import { Authority } from './user/dto/authority.entity';
import { User } from './user/dto/user.entity';
import { Task } from './tasks/dto/task.entity';
import { TaskWorker } from './tasks/dto/taskWorker.entity';
import { TaskTemplate } from './tasks/dto/taskTemplate.entity';
import { TaskTemplateMeta } from './tasks/dto/taskTemplateMeta.entity';
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const dataSourceConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Authority, User, Task, TaskTemplate, TaskWorker, TaskTemplateMeta],
  migrations: ['dist/db/migrations/*'],
  migrationsRun: true,
  synchronize: process.env.NODE_ENV === 'development',
  logging:
    process.env.NODE_ENV === 'development'
      ? true
      : ['schema', 'error', 'warn', 'info', 'log', 'migration'],
  // synchronize: true,
};
export default dataSourceConfig;
