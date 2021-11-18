[![Build Status](https://travis-ci.com/TheSpicyMeatball/js-to-css.svg?branch=main)](https://travis-ci.com/TheSpicyMeatball/js-to-css)
[![Coverage Status](https://coveralls.io/repos/github/TheSpicyMeatball/js-to-css/badge.svg?branch=main)](https://coveralls.io/github/TheSpicyMeatball/js-to-css?branch=main)

# js-to-css-generator

> Generate CSS style sheets from your css-in-js JSON objects

<p>Hello friend.</p>
<p>CSS-in-JS is awesome and powerful, but what do you do if you also have legacy apps to support which can only consume regular CSS?</p>
<p><i>[pause for effect...]</i></p>
<p>Well, that's where <code>js-to-css-generator</code> comes in to save the day!</p>
<p>With <code>js-to-css-generator</code>, you can <i>auto-MAGICALLY</i> deliver classic CSS alongside your CSS-in-JS so your legacy apps can hang around even longer! (just what you've always wanted)</p>

<p><b>Version:</b> 1.4.0</p>

<h3>Utils</h3>
<ul>
  <li><a href="#user-content-getfile">getFile</a></li>
  <li><a href="#user-content-jstocss">jsToCss</a></li>
</ul> 
<h3>Examples</h3>
<ul>
  <li><a href="#user-content-basic">Basic</a></li>
  <li><a href="#user-content-nested-styles--combinators">Nested Styles &amp; Combinators</a></li>
  <li><a href="#user-content-what-if-my-combinators-are-in-separate-objects">What if my combinators are in separate objects?</a></li>
  <li><a href="#user-content-other-advanced-features">Other Advanced Features</a></li>
  <li><a href="#user-content-multiple-files">Multiple Files</a></li>
  <li><a href="#user-content-ok-but-is-there-an-easy-way-to-build-my-file-objects-by-marking-up-my-original-source-files">OK, but is there an easy way to build my File Objects by marking up my original source files?</a></li>
  <li><a href="#user-content-just-for-fun">Just for Fun</a></li>
</ul> 

<h3>Supporting Types</h3>
<ul>
  <li><a href="#user-content-file">File</a></li>
  <li><a href="#user-content-cssfile">CSSFile</a></li>
  <li><a href="#user-content-tags">Tags</a></li>
  <li><a href="#user-content-getfilesettings">GetFileSettings</a></li>
</ul> 

<hr />


  

<h2>getFile</h2>
<p>Optional utility to help you easily create a {File} object to use with {jsToCss}</p>
<p>Since v0.0.2</p>
<table>
      <thead>
      <tr>
        <th>Param</th>
        <th>Type</th></tr>
      </thead>
      <tbody><tr><td><p><b>srcFile</b></p>The string contents of the original source file</td><td>string</td></tr><tr><td><p><b>module</b></p>Object that contains all of your styled objects</td><td>Record&lt;string, Record&lt;string, string | number&gt;&gt;</td></tr><tr><td><p><b>settings <span>(optional)</span></b></p>Optional object containing settings for how to parse the file</td><td>GetFileSettings</td></tr></tbody>
    </table><p><b>Returns:</b> {File} The generated CSS file content</p>
  <h3>Import</h3>

```
import { getFile, File, GetFileSettings, Tag } from 'js-to-css-generator';
```

  

<hr />

  

<h2>jsToCss</h2>
<p>Convert JavaScript style objects to CSS files</p>
<p>Since v0.0.1</p>
<table>
      <thead>
      <tr>
        <th>Param</th>
        <th>Type</th></tr>
      </thead>
      <tbody><tr><td><p><b>files</b></p>The configurations for the CSS files</td><td>File | File[]</td></tr></tbody>
    </table><p><b>Returns:</b> {CSSFile | CSSFile[]} The generated CSS file content</p>
  <h3>Import</h3>

```
import { jsToCss, CSSFile, File } from 'js-to-css-generator';
```

  

<hr />


<h2>Examples</h2>
<h3>Basic</h3>

<p>Let's say we have a file called <code>styles.js</code> which looks like this:</p>

```
// styles.js

export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};

export const somethingElse = {
  backgroundColor: '#ccc',
  fontSize: 10,
  padding: 8,
};
```

<p>You can create a CSS style sheet like so:</p>

```
// Get the style objects as a module via require:
const styles = require('./styles.js');

// ...or assemble all style objects into a single object:
const styles = {
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
};

// Generate CSS file
const { writeFileSync } = require('fs');
const { join } = require('path');
const { jsToCss } = require('js-to-css-generator');

const file = {
  name: 'styles.css',
  module: styles,
};

const cssFile = jsToCss(file);

writeFileSync(join(__dirname, cssFile.name), cssFile.css, 'utf8');
```

<p>The above script will create a file <code>styles.css</code> which contains:</p>

```
.something {
  background-color: #fff;
  font-size: 12px;
  padding: 16px;
}

.something-else {
  background-color: #ccc;
  font-size: 10px;
  padding: 8px;
}
```

<h3>Nested Styles &amp; Combinators</h3>
<p><code>jsToCss</code> can also handle nested styles and combinators:</p>

```
// styles.js

export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
  ':hover': {
    backgroundColor: '#ccc',
  },
  '& + &': {
    marginLeft: 8,
  },
};
```

```
// Bring in the style objects
const styles = require('./styles.js');

// Generate CSS file
const { writeFileSync } = require('fs');
const { join } = require('path');
const { jsToCss } = require('js-to-css-generator');

const file = {
  name: 'styles.css',
  module: styles,
};

const cssFile = jsToCss(file);

writeFileSync(join(__dirname, cssFile.name), cssFile.css, 'utf8');
```

<p>The above script will create a file <code>styles.css</code> which contains:</p>

```
.something {
  background-color: #fff;
  font-size: 12px;
  padding: 16px;
}

.something:hover {
  background-color: #ccc;
}

.something + .something {
  margin-left: 8px;
}
```

<h3>What if my combinators are in separate objects?</h3>
<p>In this example, we have a separate object called <code>spacing</code> which holds the combinators for <code>something</code>. We can still generate the correct styles with the <code>combinators</code> override:</p>

```
// styles.js

export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
  ':hover': {
    backgroundColor: '#ccc',
  }
};

export const spacing = {
  '& + &': {
    marginLeft: 8,
  },
};
```

```
// Bring in the style objects
const styles = require('./styles.js');

// Generate CSS file
const { writeFileSync } = require('fs');
const { join } = require('path');
const { jsToCss } = require('js-to-css-generator');

const file = {
  name: 'styles.css',
  combinators: {
    spacing: '.something',
  },
  module: styles,
};

const cssFile = jsToCss(file);

writeFileSync(join(__dirname, cssFile.name), cssFile.css, 'utf8');
```

<p>The above script will create a file <code>styles.css</code> which contains:</p>

```
.something {
  background-color: #fff;
  font-size: 12px;
  padding: 16px;
}

.something:hover {
  background-color: #ccc;
}

.something + .something {
  margin-left: 8px;
}
```

<p>Notice how we added a <code>combinators</code> key to our <code>file</code> object which contains a <code>spacing</code> key that matches the name of the object with a combinator in our <code>styles.js</code> file. The value for <code>spacing</code> indicates the class name that should be used for the combinator in place of the <code>&amp;</code>.</p>

<h3>Other Advanced Features</h3>
<p>There are more advanced features to give us more control over the output such as prepending, versioning, overrides, ignoring, etc.</p>
<p>Let's say we have a file called <code>styles.js</code> which looks like this:

```
// styles.js

export const something = {
  backgroundColor: '#fff',
  fontSize: 12,
  padding: 16,
};

export const somethingElse = {
  backgroundColor: '#ccc',
  fontSize: 10,
  padding: 8,
};

export const anotherSomething = {
  backgroundColor: 'green',
  display: 'flex',
  margin: 8,
};

export const oneMore = {
  border: '1px solid #ccc',
  padding: 16,
};
```

```
// Bring in the style objects
const styles = require('./styles.js');

// Generate CSS file
const { writeFileSync } = require('fs');
const { join } = require('path');
const { jsToCss } = require('js-to-css-generator');

const file = {
  name: 'styles.css',
  prepend: '.test',
  version: '1',
  overrides: {
    somethingElse: '.my-override',
  },
  ignore: ['anotherSomething'],
  map: true,
  module: styles,
};

const cssFile = jsToCss(file);

writeFileSync(join(__dirname, cssFile.name), cssFile.css, 'utf8');
```

<p>The above script will create a file <code>styles.css</code> which contains:</p>

```
/* something */
.test-v1-something {
  background-color: #fff;
  font-size: 12px;
  padding: 16px;
}

/* somethingElse */
.my-override {
  background-color: #ccc;
  font-size: 10px;
  padding: 8px;
}

/* oneMore */
.test-v1-one-more {
  border: 1px solid #ccc;
  padding: 16px;
}
```

<p>We have prepended all of our class names with a base class and version <code>.test-v1</code> except for <code>somethingElse</code> which has an override value of <code>.my-override</code>. We've also decided that we don't want to output <code>anotherSomething</code> so it's been added to the <code>ignore</code> list. Lastly, by setting <code>map: true</code>, we've mapped the original object name to each class name as a code comment above each class.</p>

<h3>Multiple Files</h3>
<p><code>jsToCss</code> can also handle multiple files at a time. Simply pass in an array of your <code>File</code> objects and you'll get an array of <code>CSSFile</code> objects in return:</p>

```
const files = [file1, file2, file3];
const cssFiles = jsToCss(files);
```

<h3>OK, but is there an easy way to build my File objects by marking up my original source files?</h3>
<p>Yes there is! We can use <code>getFile</code> for that.</p>
<p>Let's say we have a file called <code>styles.js</code> which looks like this:</p>

```
/** 
 * @config
 * @prepend .test
 * @map
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

export const oneMore = {
  border: '1px solid #ccc',
  padding: 16,
};
```

<p>Notice how we've marked up the file with some jsdoc tags. Especially notice the config:</p>

```
/** 
 * @config
 * @prepend .test
 * @map
 */
 ```

 <p>The presence of a <code>@config</code> in the file indicates that these are settings that we want to apply to the whole file. In this case, we want to prepend all of our classes with <code>.test</code> and we want to map the original object names to each class by including a code comment above each.</p>

<p>We can now parse those out with the <code>getFile</code> util:</p>

```
const { readFileSync } = require('fs');

// Bring in the style objects
const styles = require('./styles.js');

const srcFile = readFileSync('./styles.js', 'utf8');
const file = getFile(srcFile, styles, { name: 'styles.css', version: '1' });

const cssFile = jsToCss(file);

writeFileSync(join(__dirname, cssFile.name), cssFile.css, 'utf8');
```

<p>The above script will create a file <code>styles.css</code> which contains:</p>

```
/* something */
.test-v1-something {
  background-color: #fff;
  font-size: 12px;
  padding: 16px;
}

/* somethingElse */
.my-override {
  background-color: #ccc;
  font-size: 10px;
  padding: 8px;
}

/* oneMore */
.test-v1-one-more {
  border: 1px solid #ccc;
  padding: 16px;
}
```

<h3>Just for Fun</h3>
<p>I know what you're thinking. "That's cool, but can it do emojis?"</p>
<p>You betcha!</p>

```
// Get the style objects as a module via require:
const styles = require('./styles.js');

// Generate CSS file
const { writeFileSync } = require('fs');
const { join } = require('path');
const { jsToCss } = require('js-to-css-generator');

const file = {
  name: 'styles.css',
  prepend: '.💩',
  module: styles,
};

const cssFile = jsToCss(file);

writeFileSync(join(__dirname, cssFile.name), cssFile.css, 'utf8');
```

<p>The above script will create a file <code>styles.css</code> which contains:</p>

```
.💩-something {
  background-color: #fff;
  font-size: 12px;
  padding: 16px;
}

.💩-something-else {
  background-color: #ccc;
  font-size: 10px;
  padding: 8px;
}
```

<p>Why might you do this? I don't know, but I'm sure you have your reasons and who am I to stand in your way?</p>

<h2>Supporting Types</h2>
<p>These are optional type definitions you can import for TypeScript. If you're not using TypeScript, you can use them as reference for the object shapes that you will be passing in as arguments or getting back as a return type.</p>
<h3>File</h3>

```
export type File = {
  // any name that you would like to use as an identifier for the File
  name?: string,

  // optional string to use to prepend all of your classes for scope
  prepend?: string, 

  // optional object with key/value pairs where the keys match the
  // style object names you want to override and values that are the
  // class names to use as the overrides
  overrides?: Record<string, string>, 

  // optional object with key/value pairs where the keys match the
  // style object names you want to affect and values that are the
  // class names to use for the combinators. The value will replace
  // any '&' in your style names.
  combinators?: Record<string, string>,

  // optional array of names of style objects you don't want to
  // include as part of the output CSS file
  ignore?: string[],

  // optional string representation of the file version to add as
  // part of the class name
  version?: string,
  
  // optionally map the original object name to the outputted class
  // name via including a code comment above the class name with the
  // original object name
  map?: boolean,

  // object that contains all of your styled objects
  module: Record<string, Record<string, string | number>>,
};
```

<h3>CSSFile</h3>

```
export type CSSFile = {
  // any name that you gave your {File}
  name?: string,
  
  // The CSS file string content
  css: string,
};
```

<h3>Tags</h3>
<p>Object used to define what the jsdoc tags are for parsing with <code>getFile</code>.</p>

```
export type Tags = {
  class?: string,
  combinator?: string,
  config?: string,
  ignore?: string,
  map?: string,
  prepend?: string,
};
```

<p>If not specified, the default values are:</p>

```
{
  class: '@class',
  combinator: '@combinator',
  config: '@config',
  ignore: '@ignore',
  map: '@map',
  prepend: '@prepend',
};
```

<h3>GetFileSettings</h3>

```
export type GetFileSettings = {
  // any name that you gave your {File}
  name?: string, 

  // optional string to use to prepend all of your classes for scope
  prepend?: string, 

  // optional string representation of the file version to add as
  // part of the class name
  version?: string, 

  // RegEx string used to find specific objects and jsdoc inside the
  // source file. This string should include 'XXXXXX' in it which
  // will be a placeholder for the object name to search for.
  styleRegEx?: string, 

  // Object used to define what the jsdoc tags are for parsing
  tags?: Tags, 
};
```

<a href="#package-contents"></a>
<h2>Package Contents</h2>

Within the module you'll find the following directories and files:

```html
package.json
CHANGELOG.md -- history of changes to the module
LICENSE
README.md -- this file
/lib
  └───/es5
    └───/getFile
      └───index.d.ts - 872 Bytes
      └───index.js - 4.1 KB
      └───index.d.ts - 141 Bytes
      └───index.js - 430 Bytes
    └───/jsToCss
      └───index.d.ts - 519 Bytes
      └───index.js - 10.06 KB
      └───types.d.ts - 707 Bytes
      └───types.js - 79 Bytes
  └───/es6
    └───/getFile
      └───index.d.ts - 872 Bytes
      └───index.js - 3.81 KB
      └───index.d.ts - 141 Bytes
      └───index.js - 76 Bytes
    └───/jsToCss
      └───index.d.ts - 519 Bytes
      └───index.js - 9.86 KB
      └───types.d.ts - 707 Bytes
      └───types.js - 12 Bytes
```

<a href="#license"></a>
<h2>License</h2>

MIT