import { assign, first, isNilOrEmpty, isNotNilOrEmpty, removeKeys } from '@paravano/utils';
import { getCommentsFromFile, parseTags } from 'jsdoc-parse-plus';

import { File, GetFileSettings, Tags } from '../types';

/**
 * Optional utility to help you easily create a {File} object to use with {jsToCss}
 * 
 * @since v0.0.2
 * @param {string} srcFile The string contents of the original source file
 * @param {Record<string, Record<string, string | number>>} module Object that contains all of your styled objects
 * @param {GetFileSettings} [settings] Optional object containing settings for how to parse the file
 * @returns {File} The generated CSS file content
 * @docgen_import { getFile, File, GetFileSettings, Tag }
 * @docgen_imp_note <em>File</em>, <em>GetFileSettings</em>, and <em>Tag</em> are TypeScript types and are only for (optional) use with TypeScript projects
 */
export const getFile = (
  srcFile: string, 
  module: Record<string, Record<string, string | number>>, 
  settings?: GetFileSettings,
) : File => {
  const { map: _map, name, prepend, version, styleRegEx, tags } = settings;

  const defaultTags: Tags = {
    class: '@class',
    combinator: '@combinator',
    config: '@config',
    ignore: '@ignore',
    map: '@map',
    prepend: '@prepend',
  };

  const _tags: Tags = isNotNilOrEmpty(tags) ? assign(defaultTags, tags) : defaultTags;

  const getTagValue = (jsdoc: Record<string, unknown>) => (tag: string) => 
    tag === _tags.ignore || tag === _tags.map
    ? isNotNilOrEmpty(jsdoc[tag.replace('@', '')]) 
    : (jsdoc[tag.replace('@', '')] as any)?.value;

  const regex = isNotNilOrEmpty(styleRegEx)
                ? styleRegEx
                : '(?:\\/\\*\\* *.*?(?:\\r\\n|\\n|\\r)?(?: *\\* ?.*?(?:\\r\\n|\\n|\\r))*)?export const XXXXXX (?:= .*;|(?:.*(?:\\r\\n|\\n|\\r))*?};)';

  const objectNames = Object.keys(module);
  const configRaw = getCommentsFromFile(srcFile).find(x => x.includes(_tags.config));
  const config = isNotNilOrEmpty(configRaw) ? parseTags(configRaw, [_tags.config, _tags.prepend, _tags.map]) : undefined;
  const baseClass = isNotNilOrEmpty(config)
                    ? getTagValue(config)(_tags.prepend) ?? prepend
                    : prepend;
  const map = isNotNilOrEmpty(config) && getTagValue(config)(_tags.map) || !!_map;

  let file: File = {
    name,
    prepend: baseClass,
    version,
    map,
    module,
  };

  for (const name of objectNames) {
    const raw = first(srcFile.match(regex.replace('XXXXXX', name)), '');
    const jsdoc = parseTags(first(getCommentsFromFile(raw), ''), Object.keys(_tags).map(x => _tags[x]));
    const tag = getTagValue(jsdoc);

    if (tag(_tags.ignore)) {
      file = assign(file, { ignore: isNilOrEmpty(file.ignore) ? [name] : file.ignore.concat([name]) }) as File;
    } else {
      if (isNotNilOrEmpty(tag(_tags.class))) {
        file = assign(file, {
          overrides: assign(file.overrides ?? {}, {
            [name]: tag(_tags.class),
          }),
        }) as File;
      }

      if (isNotNilOrEmpty(tag(_tags.combinator))) {
        file = assign(file, {
          combinators: assign(file.combinators ?? {}, {
            [name]: tag(_tags.combinator),
          }),
        }) as File;
      }
    }
  }

  if (isNilOrEmpty(file.version)) {
    file = removeKeys(file, ['version']);
  }

  return file;
};