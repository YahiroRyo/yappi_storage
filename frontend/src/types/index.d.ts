declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV?: string;
        NEXT_PUBLIC_API_URL: string;
      }
    }
  }
}
