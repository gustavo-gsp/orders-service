import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';

import { validateEnv } from './config/env.config';
import { HealthModule } from './infra/health/health.module';
import { DbModule } from './infra/db/db.module';
import { OrderModule } from './modules/order/order.module';
import { RedisModule } from './infra/redis/redis.module';

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
          playground: false,
          introspection: !isProd,
          includeStacktraceInErrorResponses: false,
          plugins: [
            isProd
              ? ApolloServerPluginLandingPageDisabled()
              : ApolloServerPluginLandingPageLocalDefault(),
          ],
        };
      },
    }),

    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            genReqId: (req, res) => {
              const existing = req.headers['x-request-id'];
              const id = Array.isArray(existing) ? existing[0] : existing;
              const reqId = id ?? randomUUID();
              res.setHeader('x-request-id', reqId);
              return reqId;
            },

            transport: isProd
              ? undefined
              : {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              },

            serializers: {
              req(req) {
                return {
                  id: req.id,
                  method: req.method,
                  url: req.url,
                  remoteAddress: req.socket?.remoteAddress,
                  userAgent: req.headers['user-agent'],
                };
              },

              res(res) {
                return {
                  statusCode: res.statusCode,
                };
              },
            },
            autoLogging: {
              ignore: (req) => req.url === '/health',
            },
              redact: {
                paths: [
                  'req.headers.authorization',
                  'req.headers.cookie',
                ],
                remove: true,
              },
            },
          };
        },
    }),

    HealthModule,
    DbModule,
    OrderModule,
    RedisModule,
  ],
})
export class AppModule { }