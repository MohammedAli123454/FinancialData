// /app/types/authjs.d.ts

declare module "auth" {
  export interface AuthOptions {
    session: { strategy: "jwt" | "database" };
    providers: any[];
    callbacks?: {
      jwt?: (params: { token: any; user?: any }) => Promise<any> | any;
      session?: (params: { session: any; token: any }) => Promise<any> | any;
    };
    [key: string]: any;
  }
  
  /**
   * The main Auth.js function.
   */
  const Auth: (options: AuthOptions) => any;
  export default Auth;
}

declare module "auth/server" {
  import { AuthOptions } from "auth";
  /**
   * Retrieves the server-side session using Auth.js.
   */
  export function getServerSession(options: AuthOptions, request: Request): Promise<any>;
}

declare module "auth/providers/credentials" {
  /**
   * A credentials provider.
   */
  const CredentialsProvider: (options: any) => any;
  export default CredentialsProvider;
}

declare module "auth/react" {
  export function useSession(): { data: any; status: string };
  export function signOut(): void;
}

declare module "next-auth/react" {
  export function signIn(...args: any): any;
  export function signOut(...args: any): any;
  export function useSession(...args: any): any;
}

declare module "auth/server" {
  import { AuthOptions } from "auth";
  export function getServerSession(options: AuthOptions, request: Request): Promise<any>;
}

