import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor(private configService: ConfigService) {
        const prisma = new PrismaClient();

        super({
            datasources: {
                db: {
                    url: configService.get<string>('DATABASE_URL'),
                },
            },
        });

        Object.assign(this, prisma);
    }

    async onModuleInit() {
        console.log('Connecting to the database');
        await this.$connect();

    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}