import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { validateEnv } from './config/env.config';
import { HealthModule } from './infra/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';
        return {
          autoSchemaFile: join(process.cwd(), 'schema.gql'),
          sortSchema: true,
          playground: !isProd,
          introspection: !isProd,
        };
      },
    }),

    HealthModule,
  ],
})
export class AppModule {}