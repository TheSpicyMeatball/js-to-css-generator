export type File = {
  name?: string,
  prepend?: string,
  overrides?: Record<string, string>,
  combinators?: Record<string, string>,
  ignore?: string[],
  version?: string,
  map?: boolean,
  module: Record<string, Record<string, string | number>>,
};

export type CSSFile = {
  name?: string,
  css: string,
  objectToStyleMap: Map<string, string>,
  styleToObjectMap: Map<string, string>,
};

export type Tags = {
  class?: string,
  combinator?: string,
  config?: string,
  ignore?: string,
  map?: string,
  prepend?: string,
};

export type GetFileSettings = {
  name?: string, 
  prepend?: string, 
  version?: string, 
  styleRegEx?: string, 
  tags?: Tags, 
  map?: boolean,
};