export interface Delegate {
  aggregate(data: unknown);
  count(data: unknown);
  create(data: unknown);
  createMany(data: unknown);
  delete(data: unknown);
  deleteMany(data: unknown);
  findFirst(data: unknown);
  findMany(data: unknown);
  findUnique(data: unknown);
  update(data: unknown);
  updateMany(data: unknown);
  upsert(data: unknown);
}
