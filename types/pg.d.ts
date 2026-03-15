declare module "pg" {
  export class Pool {
    constructor(config?: Record<string, unknown>);
    query<T = unknown>(
      text: string,
      values?: ReadonlyArray<string | number | boolean | null>
    ): Promise<{ rows: T[] }>;
  }
}
