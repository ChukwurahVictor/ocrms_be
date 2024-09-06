import { Prisma } from '@prisma/client';
import { CrudMapType } from 'src/interfaces/crud-map-type.interface';

export class ComplaintMapType implements CrudMapType {
  aggregate: Prisma.ComplaintAggregateArgs;
  count: Prisma.ComplaintCountArgs;
  create: Prisma.ComplaintCreateArgs;
  delete: Prisma.ComplaintDeleteArgs;
  deleteMany: Prisma.ComplaintDeleteManyArgs;
  findFirst: Prisma.ComplaintFindFirstArgs;
  findMany: Prisma.ComplaintFindManyArgs;
  findUnique: Prisma.ComplaintFindUniqueArgs;
  update: Prisma.ComplaintUpdateArgs;
  updateMany: Prisma.ComplaintUpdateManyArgs;
  upsert: Prisma.ComplaintUpsertArgs;
}
