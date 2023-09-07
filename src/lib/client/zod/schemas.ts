import z from "zod";

export type Body_login_for_access_token = z.infer<typeof Body_login_for_access_token>;
export const Body_login_for_access_token = z.object({
  grant_type: z.union([z.string(), z.null(), z.array(z.union([z.string(), z.null()])), z.undefined()]).optional(),
  username: z.string(),
  password: z.string(),
  scope: z.union([z.string(), z.undefined()]).optional(),
  client_id: z.union([z.string(), z.null(), z.array(z.union([z.string(), z.null()])), z.undefined()]).optional(),
  client_secret: z.union([z.string(), z.null(), z.array(z.union([z.string(), z.null()])), z.undefined()]).optional(),
});

export type ValidationError = z.infer<typeof ValidationError>;
export const ValidationError = z.object({
  loc: z.array(z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])),
  msg: z.string(),
  type: z.string(),
});

export type HTTPValidationError = z.infer<typeof HTTPValidationError>;
export const HTTPValidationError = z.object({
  detail: z.array(ValidationError).optional(),
});

export type SearchTodoStatus = z.infer<typeof SearchTodoStatus>;
export const SearchTodoStatus = z.union([z.literal("all"), z.literal("done"), z.literal("pending")]);

export type Todo = z.infer<typeof Todo>;
export const Todo = z.object({
  title: z.string(),
  description: z.string(),
  is_done: z.boolean(),
  id: z.number(),
  user_id: z.number(),
});

export type TodoCreate = z.infer<typeof TodoCreate>;
export const TodoCreate = z.object({
  title: z.string(),
  description: z.string(),
  is_done: z.boolean(),
});

export type Token = z.infer<typeof Token>;
export const Token = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export type User = z.infer<typeof User>;
export const User = z.object({
  username: z.string(),
  id: z.number(),
  todos: z.array(Todo),
});

export type UserCreate = z.infer<typeof UserCreate>;
export const UserCreate = z.object({
  username: z.string(),
  password: z.string(),
  confirm_password: z.string(),
});

export type post_Login_for_access_token = typeof post_Login_for_access_token;
export const post_Login_for_access_token = {
  method: z.literal("POST"),
  path: z.literal("/oauth/token"),
  parameters: z.never(),
  response: Token,
};

export type post_Signup = typeof post_Signup;
export const post_Signup = {
  method: z.literal("POST"),
  path: z.literal("/user/signup"),
  parameters: z.never(),
  response: User,
};

export type get_List_all = typeof get_List_all;
export const get_List_all = {
  method: z.literal("GET"),
  path: z.literal("/user/list-all"),
  parameters: z.object({
    query: z.object({
      skip: z.number().optional(),
      limit: z.number().optional(),
    }),
  }),
  response: z.array(User),
};

export type get_Info = typeof get_Info;
export const get_Info = {
  method: z.literal("GET"),
  path: z.literal("/user/info"),
  parameters: z.never(),
  response: User,
};

export type post_Create_for_user = typeof post_Create_for_user;
export const post_Create_for_user = {
  method: z.literal("POST"),
  path: z.literal("/todo/create"),
  parameters: z.never(),
  response: Todo,
};

export type patch_Update = typeof patch_Update;
export const patch_Update = {
  method: z.literal("PATCH"),
  path: z.literal("/todo/update"),
  parameters: z.never(),
  response: Todo,
};

export type delete_Remove = typeof delete_Remove;
export const delete_Remove = {
  method: z.literal("DELETE"),
  path: z.literal("/todo/remove"),
  parameters: z.never(),
  response: z.unknown(),
};

export type get_Get_for_user = typeof get_Get_for_user;
export const get_Get_for_user = {
  method: z.literal("GET"),
  path: z.literal("/todo/list"),
  parameters: z.object({
    query: z.object({
      status: SearchTodoStatus.optional(),
    }),
  }),
  response: z.array(Todo),
};

export type get_Get_all = typeof get_Get_all;
export const get_Get_all = {
  method: z.literal("GET"),
  path: z.literal("/todo/all-users"),
  parameters: z.object({
    query: z.object({
      skip: z.number().optional(),
      limit: z.number().optional(),
    }),
  }),
  response: z.array(Todo),
};

// <EndpointByMethod>
export const EndpointByMethod = {
  post: {
    "/oauth/token": post_Login_for_access_token,
    "/user/signup": post_Signup,
    "/todo/create": post_Create_for_user,
  },
  get: {
    "/user/list-all": get_List_all,
    "/user/info": get_Info,
    "/todo/list": get_Get_for_user,
    "/todo/all-users": get_Get_all,
  },
  patch: {
    "/todo/update": patch_Update,
  },
  delete: {
    "/todo/remove": delete_Remove,
  },
};
export type EndpointByMethod = typeof EndpointByMethod;
// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
export type PostEndpoints = EndpointByMethod["post"];
export type GetEndpoints = EndpointByMethod["get"];
export type PatchEndpoints = EndpointByMethod["patch"];
export type DeleteEndpoints = EndpointByMethod["delete"];
export type AllEndpoints = EndpointByMethod[keyof EndpointByMethod];
// </EndpointByMethod.Shorthands>

// <ApiClientTypes>
export type EndpointParameters = {
  body?: unknown;
  query?: Record<string, unknown>;
  header?: Record<string, unknown>;
  path?: Record<string, unknown>;
};

export type MutationMethod = "post" | "put" | "patch" | "delete";
export type Method = "get" | "head" | MutationMethod;

export type DefaultEndpoint = {
  parameters?: EndpointParameters | undefined;
  response: unknown;
};

export type Endpoint<TConfig extends DefaultEndpoint = DefaultEndpoint> = {
  operationId: string;
  method: Method;
  path: string;
  parameters?: TConfig["parameters"];
  meta: {
    alias: string;
    hasParameters: boolean;
    areParametersRequired: boolean;
  };
  response: TConfig["response"];
};

type Fetcher = (
  method: Method,
  url: string,
  parameters?: EndpointParameters | undefined,
) => Promise<Endpoint["response"]>;

type RequiredKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? never : P;
}[keyof T];

type MaybeOptionalArg<T> = RequiredKeys<T> extends never ? [config?: T] : [config: T];


