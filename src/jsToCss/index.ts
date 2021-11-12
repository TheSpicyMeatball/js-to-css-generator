import { first, iif, isNotNilOrEmpty, kebab } from '@paravano/utils';
import { CSSFile, File } from '../types';

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
  const _files = Array.isArray(files) ? files : [files];

  const getCss = (obj: Record<string, unknown>, className: string, innerWrapper?: string, combinator?: string, objName?: string) => {
    const keys = Object.keys(obj);
    keys.sort();
    
    let cssClass = iif(isNotNilOrEmpty(objName), `/* ${objName} */\n`, '') + (
      isNotNilOrEmpty(innerWrapper)
      ? `${className} {\n  ${innerWrapper} {\n`
      : `${className} {\n`
    );

    let outer = '';

    for (const key of keys) {
      if (key === 'label') continue;
      
      if (key.startsWith(':')) {
        outer = outer + getCss(obj[key] as Record<string, unknown>, `${className}${key}`, undefined, undefined, objName);
      } else if (typeof obj[key] === 'object' && key.startsWith('@media')) {
        outer = outer + getCss(obj[key] as Record<string, unknown>, key, className, undefined, objName);
      } else if (typeof obj[key] === 'object' && key.startsWith('[')) {
        outer = outer + getCss(obj[key] as Record<string, unknown>, `${className}${key}`, undefined, undefined, objName);
      } else if (typeof obj[key] === 'object') {
        outer = key.includes('&')
                ? outer + getCss(obj[key] as Record<string, unknown>, key.replace(/&/g, isNotNilOrEmpty(combinator) ? combinator : className), undefined, undefined, objName)
                : outer + getCss(obj[key] as Record<string, unknown>, `${className} ${key}`, undefined, undefined, objName);
      } else if (obj[key] !== undefined) {
        cssClass = cssClass + `  ${isNotNilOrEmpty(innerWrapper) ? '  ' : ''}${key.startsWith('--') ? key : kebab(key)}: ${obj[key]}${typeof obj[key] === 'number' && obj[key] !== 0 ? 'px' : ''};\n`;
      }
    }

    return cssClass + (isNotNilOrEmpty(innerWrapper) ? '  }\n' : '') + '}\n\n' + outer;
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
        if (isNotNilOrEmpty(file.overrides?.[name])) {
          const combinator = file.combinators?.[name] ?? baseClass;

          css = css + getCss(file.module[name], file.overrides[name], undefined, combinator, file.map ? name : undefined);
        } else {
          const className = baseClass.endsWith(kebab(name)) 
                            ? baseClass 
                            : iif(baseClass !== '.', baseClass + '-', baseClass) + kebab(name);

          const combinator = file.combinators?.[name] ?? iif(baseClass !== '.', baseClass, undefined);

          css = css + getCss(file.module[name], className, undefined, combinator, file.map ? name : undefined);
        }
      }
    }

    // remove empty styles
    css = css.replace(/(?:\/* ?.*? ?\*\/(?:\r\n|\n|\r))?.*? {(?:\r\n|\n|\r)}(?:\r\n|\n|\r)?(?:\r\n|\n|\r)?/g, '');

    output = output.concat({ name: file.name, css: css.trim() });
  }

  return Array.isArray(files) ? output : first(output);
};