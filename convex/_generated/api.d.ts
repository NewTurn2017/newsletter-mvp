/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiSlug from "../aiSlug.js";
import type * as articles from "../articles.js";
import type * as emailSends from "../emailSends.js";
import type * as files from "../files.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_slug from "../lib/slug.js";
import type * as sendArticle from "../sendArticle.js";
import type * as subscribers from "../subscribers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiSlug: typeof aiSlug;
  articles: typeof articles;
  emailSends: typeof emailSends;
  files: typeof files;
  "lib/auth": typeof lib_auth;
  "lib/email": typeof lib_email;
  "lib/slug": typeof lib_slug;
  sendArticle: typeof sendArticle;
  subscribers: typeof subscribers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
