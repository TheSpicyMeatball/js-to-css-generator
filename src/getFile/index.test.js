/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { getFile } = require('../../dist/lib/es5/getFile');

describe('getFile', () => {
  test('basic', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
    };

    const srcFile = `
export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};`;

    expect(getFile(srcFile, _module, { name: 'styles.css' })).toStrictEqual({
      name: 'styles.css',
      module: _module,
      prepend: undefined,
      map: false,
    });
  });

  test('advanced', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
      somethingElse: {
        backgroundColor: '#ccc',
        fontSize: 10,
        padding: 8,
      },
      anotherSomething: {
        backgroundColor: 'green',
        display: 'flex',
        margin: 8,
      },
      anotherIgnore: {
        backgroundColor: 'green',
        display: 'flex',
        margin: 8,
      },
      oneMore: {
        border: '1px solid #ccc',
        padding: 16,
      },
      combinators: {
        '& + &': {
          marginLeft: 8,
        },
      },
    };

    const srcFile = `
/** 
 * @config
 * @prepend .test
 */


export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};

/** @class .my-override */
export const somethingElse = {
  backgroundColor: '#ccc',
  fontSize: 10,
  padding: 8,
};

/** @ignore */
export const anotherSomething = {
  backgroundColor: 'green',
  display: 'flex',
  margin: 8,
};

/** @ignore */
export const anotherIgnore = {
  backgroundColor: 'green',
  display: 'flex',
  margin: 8,
};

export const oneMore = {
  border: '1px solid #ccc',
  padding: 16,
};

/** @combinator .one-more */
export const combinators = {
  '& + &': {
    marginLeft: 8,
  },
};`;

    expect(getFile(srcFile, _module, { name: 'styles.css', version: '1' })).toStrictEqual({
      name: 'styles.css',
      prepend: '.test', 
      overrides: { somethingElse: '.my-override' }, 
      ignore: ['anotherSomething', 'anotherIgnore'],
      combinators: {
        combinators: '.one-more',
      },
      version: '1',
      map: false,
      module: _module,
    });
  });

  test('multiple class & combinator overrides', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
      somethingElse: {
        backgroundColor: '#ccc',
        fontSize: 10,
        padding: 8,
      },
      anotherSomething: {
        backgroundColor: 'green',
        display: 'flex',
        margin: 8,
      },
      anotherOverride: {
        backgroundColor: 'green',
        display: 'flex',
        margin: 8,
      },
      oneMore: {
        border: '1px solid #ccc',
        padding: 16,
      },
      combinators: {
        '& + &': {
          marginLeft: 8,
        },
      },
      firstChild: {
        '&:first-child': {
          marginLeft: 8,
        },
      },
    };

    const srcFile = `
/** 
 * @config
 * @prepend .test
 */


export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};

/** @class .my-override */
export const somethingElse = {
  backgroundColor: '#ccc',
  fontSize: 10,
  padding: 8,
};

/** @ignore */
export const anotherSomething = {
  backgroundColor: 'green',
  display: 'flex',
  margin: 8,
};

/** @class .another-override */
export const anotherOverride = {
  backgroundColor: 'green',
  display: 'flex',
  margin: 8,
};

export const oneMore = {
  border: '1px solid #ccc',
  padding: 16,
};

/** @combinator .one-more */
export const combinators = {
  '& + &': {
    marginLeft: 8,
  },
};

/** @combinator .one-more */
export const firstChild = {
  '&:first-child': {
    marginLeft: 8,
  },
};`;

    expect(getFile(srcFile, _module, { name: 'styles.css', version: '1' })).toStrictEqual({
      name: 'styles.css',
      prepend: '.test', 
      overrides: { 
        somethingElse: '.my-override',
        anotherOverride: '.another-override',
      }, 
      ignore: ['anotherSomething'],
      combinators: {
        combinators: '.one-more',
        firstChild: '.one-more',
      },
      version: '1',
      map: false,
      module: _module,
    });
  });

  test('tag overrides', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
      somethingElse: {
        backgroundColor: '#ccc',
        fontSize: 10,
        padding: 8,
      },
      anotherSomething: {
        backgroundColor: 'green',
        display: 'flex',
        margin: 8,
      },
      anotherIgnore: {
        backgroundColor: 'green',
        display: 'flex',
        margin: 8,
      },
      oneMore: {
        border: '1px solid #ccc',
        padding: 16,
      },
      combinators: {
        '& + &': {
          marginLeft: 8,
        },
      },
    };

    const srcFile = `
/** 
 * @config
 * @prepend .test
 */


export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};

/** @override .my-override */
export const somethingElse = {
  backgroundColor: '#ccc',
  fontSize: 10,
  padding: 8,
};

/** @ignore */
export const anotherSomething = {
  backgroundColor: 'green',
  display: 'flex',
  margin: 8,
};

/** @ignore */
export const anotherIgnore = {
  backgroundColor: 'green',
  display: 'flex',
  margin: 8,
};

export const oneMore = {
  border: '1px solid #ccc',
  padding: 16,
};

/** @combinator .one-more */
export const combinators = {
  '& + &': {
    marginLeft: 8,
  },
};`;

    expect(getFile(srcFile, _module, { name: 'styles.css', version: '1', tags: { class: '@override' } })).toStrictEqual({
      name: 'styles.css',
      prepend: '.test', 
      overrides: { somethingElse: '.my-override' }, 
      ignore: ['anotherSomething', 'anotherIgnore'],
      combinators: {
        combinators: '.one-more',
      },
      version: '1',
      map: false,
      module: _module,
    });
  });

  test('custom regex', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
    };

    const srcFile = `
export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};`;

    const styleRegEx = '(?:\\/\\*\\* *.*?(?:\\r\\n|\\n|\\r)?(?: *\\* ?.*?(?:\\r\\n|\\n|\\r))*)?export const XXXXXX (?:= .*;|(?:.*(?:\\r\\n|\\n|\\r))*?};)';

    expect(getFile(srcFile, _module, { name: 'styles.css', styleRegEx })).toStrictEqual({
      name: 'styles.css',
      module: _module,
      prepend: undefined,
      map: false,
    });
  });

  test('prepend', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
    };

    const srcFile = `
export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};`;

    expect(getFile(srcFile, _module, { name: 'styles.css', prepend: '.test' })).toStrictEqual({
      name: 'styles.css',
      module: _module,
      prepend: '.test',
      map: false,
    });
  });
  
  test('config prepend', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
    };

    const srcFile = `
/**
 * @config
 * @prepend .test
 */

export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};`;

    expect(getFile(srcFile, _module, { name: 'styles.css' })).toStrictEqual({
      name: 'styles.css',
      module: _module,
      prepend: '.test',
      map: false,
    });
  });

  test('prepend + config prepend', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
    };

    const srcFile = `
/**
 * @config
 * @prepend .prepend
 */

export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};`;

    expect(getFile(srcFile, _module, { name: 'styles.css', prepend: '.test' })).toStrictEqual({
      name: 'styles.css',
      module: _module,
      prepend: '.prepend',
      map: false,
    });
  });

  test('map', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
    };

    const srcFile = `
export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};`;

    expect(getFile(srcFile, _module, { name: 'styles.css', map: true })).toStrictEqual({
      name: 'styles.css',
      module: _module,
      map: true,
      prepend: undefined,
    });
  });
  
  test('config map', () => {
    const _module = {
      something: {
        backgroundColor: '#fff',
        fontSize: 12,
        padding: 16,
      },
    };

    const srcFile = `
/**
 * @config
 * @map
 */

export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};`;

    expect(getFile(srcFile, _module, { name: 'styles.css' })).toStrictEqual({
      name: 'styles.css',
      module: _module,
      map: true,
      prepend: undefined,
    });
  });
});