import { first, iif, isNilOrEmpty, isNotNilOrEmpty, kebab } from '@paravano/utils';
import { CSSFile, File } from '../types';

type MediaQuery = { key: string, obj: Record<string, unknown>, children?: MediaQuery[] };
type Item = { key: string, obj: Record<string, unknown> };

/**
 * Convert JavaScript style objects to CSS files
 * 
 * @since v0.0.1
 * @param {File | File[]} files The configurations for the CSS files
 * @returns {CSSFile | CSSFile[]} The generated CSS file content
 * @docgen_import { jsToCss, CSSFile, File }
 * @docgen_imp_note <em>CSSFile</em> and <em>File</em> are TypeScript types and are only for (optional) use with TypeScript projects
 */
export const jsToCss = (files: File | File[]) : CSSFile | CSSFile[] => {
  let output: CSSFile[] = [];
  const objectToStyleMap = new Map<string, string>();
  const styleToObjectMap = new Map<string, string>();
  const _files = Array.isArray(files) ? files : [files];

  const getCss = ({ obj, className, combinator, objName, indent = '' } : {
    obj: Record<string, unknown>, 
    className: string,
    combinator?: string, 
    objName?: string, 
    indent?: string,
  }) => {
    const keys = Object.keys(obj);
    keys.sort();
    
    let cssClass = iif(isNotNilOrEmpty(objName), `${indent}/* ${objName} */\n`, '') + `${indent}${className.trim()} {\n`;

    let outer = '';

    // Keys that have number types which we should NOT add 'px' to...
    const numberPxExclusions = ['zIndex', 'zoom'];

    for (const key of keys) {
      if (key === 'label' || (typeof obj[key] === 'object' && (key.startsWith('@media') || key.startsWith('@keyframes')))) continue;
      
      if (key.startsWith(':')) {
        // pseudo selector
        outer = outer + getCss({
          obj: obj[key] as Record<string, unknown>, 
          className: `${className}${key}`,
          objName, 
          indent,
        });

      } else if (typeof obj[key] === 'object' && key.startsWith('[')) {
        // attribute selector
        outer = outer + getCss({
          obj: obj[key] as Record<string, unknown>, 
          className: `${className}${key}`,
          objName,
          indent,
        });
        
      } else if (typeof obj[key] === 'object') {
        // nested object
        outer = key.includes('&')
                ? outer + getCss({
                  obj: obj[key] as Record<string, unknown>, 
                  className: key.replace(/&/g, isNotNilOrEmpty(combinator) ? combinator : className), 
                  objName,
                  indent, 
                })
                : outer + getCss({
                  obj: obj[key] as Record<string, unknown>, 
                  className: `${className} ${key}`, 
                  objName,
                  indent,
                });

      } else if (obj[key] !== undefined) {
        const prop = key.startsWith('-') ? key : kebab(key).replace(/^webkit-/g, '-webkit-');
        cssClass = cssClass + `  ${indent}${prop}: ${obj[key]}${typeof obj[key] === 'number' && !numberPxExclusions.includes(key) && obj[key] !== 0 ? 'px' : ''};\n`;
      }
    }
    
    return cssClass + indent + '}\n\n' + outer;
  };

  const getMediaQueries = (obj: Record<string, unknown>) : MediaQuery[] => {
    const keys = Object.keys(obj);
    keys.sort();
    
    let output = [];

    for (const key of keys) {      
      if (typeof obj[key] === 'object' && key.startsWith('@media')) {
        // media query
        const query = { key, obj: obj[key], children: getMediaQueries(obj[key] as Record<string, unknown>) };
        output = [...output, query];
      } else if (typeof obj[key] === 'object') {
        // nested object style
        output = [...output, ...getMediaQueries(obj[key] as Record<string, unknown>)];
      } 
    }

    return output;
  };

  const getKeyframes = (obj: Record<string, unknown>) : Item[] => {
    const keys = Object.keys(obj);
    keys.sort();
    
    let output = [];

    for (const key of keys) {      
      if (typeof obj[key] === 'object' && key.startsWith('@keyframes')) {
        // keyframes
        const keyframes = { key, obj: obj[key] };
        output = [...output, keyframes];
      } else if (typeof obj[key] === 'object') {
        // nested object style
        output = [...output, ...getKeyframes(obj[key] as Record<string, unknown>)];
      } 
    }

    return output;
  };

  const getKeyframesCss = (keyframes: Item[]) : string => {
    let output = '';

    for (const item of keyframes) {
      const keys = Object.keys(item.obj);
      output = output + `${item.key} {\n${keys.map(x => getCss({
        obj: item.obj[x] as Record<string, unknown>,
        className: x,
        indent: '  ',
      }).replace(/(?:\r\n|\n|\r)$/g, '')).join('')}}\n\n`;
    }

    return output;
  };

  for (let i = 0; i < _files.length; i++) {
    let css = '';
    const file = _files[i];
    const objectNames = Object.keys(file.module);

    let baseClass = '.';

    if (isNotNilOrEmpty.all(file.prepend, file.version)) {
      baseClass = `${file.prepend}-v${file.version.replace(/\./g, '-')}`;
    } else if (isNotNilOrEmpty(file.prepend)) {
      baseClass = file.prepend;
    } else if (isNotNilOrEmpty(file.version)) {
      baseClass = '.v' + file.version.replace(/\./g, '-');
    }

    for (const name of objectNames) {
      if (!file.ignore?.includes(name)) {
        const media = getMediaQueries(file.module[name]);
        const keyframes = getKeyframes(file.module[name]);
        const keyframesCss = getKeyframesCss(keyframes);

        if (isNotNilOrEmpty(file.overrides?.[name])) {
          const combinator = file.combinators?.[name] ?? baseClass;

          objectToStyleMap.set(name, file.combinators?.[name] ?? file.overrides[name]);
          styleToObjectMap.set(file.combinators?.[name] ?? file.overrides[name], name);
          // styleMap = assign(styleMap, { [name]: file.combinators?.[name] ?? file.overrides[name] }) as Record<string, string>;
          
          css = css + getCss({
            obj: file.module[name], 
            className: file.overrides[name],
            combinator, 
            objName: file.map ? name : undefined,
          });

          const getMediaCss = (media: MediaQuery[], indent: string) : string => {
            if (isNilOrEmpty(media)) return '';

            const mediaCss = media.map(x => `${indent}${x.key} {\n${getCss({
              obj: x.obj, 
              className: file.overrides[name], 
              combinator, 
              objName: file.map ? name : undefined,
              indent: indent + '  ',
            }).replace(/(?:\r\n|\n|\r)$/g, '')}${getMediaCss(x.children, indent + '  ')}${indent}}\n`);
            return mediaCss.join('\n');
          };

          css = css + getMediaCss(media, '');
        } else {
          const className = baseClass.endsWith(kebab(name)) 
                            ? baseClass 
                            : iif(baseClass !== '.', baseClass + '-', baseClass) + kebab(name);

          const combinator = file.combinators?.[name] ?? iif(baseClass !== '.', baseClass, undefined);

          objectToStyleMap.set(name, file.combinators?.[name] ?? className);
          styleToObjectMap.set(file.combinators?.[name] ?? className, name);
          // styleMap = assign(styleMap, { [name]: file.combinators?.[name] ?? className }) as Record<string, string>;

          css = css + getCss({
            obj: file.module[name], 
            className, 
            combinator, 
            objName: file.map ? name : undefined,
          });
          
          const getMediaCss = (media: MediaQuery[], indent: string) : string => {
            if (isNilOrEmpty(media)) return '';

            const mediaCss = media.map(x => `${indent}${x.key} {\n${getCss({
              obj: x.obj, 
              className, 
              combinator, 
              objName: file.map ? name : undefined,
              indent: indent + '  ',
            }).replace(/(?:\r\n|\n|\r)$/g, '')}${getMediaCss(x.children, indent + '  ')}${indent}}\n`);
            return mediaCss.join('\n');
          };

          css = css + getMediaCss(media, '');
        }

        css = css + keyframesCss;
      }
    }

    // remove empty styles
    css = css.replace(/ *(?:\/* ?.*? ?\*\/(?:\r\n|\n|\r))?.*? {(?:\r\n|\n|\r) *}(?:\r\n|\n|\r)?(?:\r\n|\n|\r)?/g, '');

    output = output.concat({ name: file.name, css: css.trim(), objectToStyleMap, styleToObjectMap });
  }

  return Array.isArray(files) ? output : first(output);
};