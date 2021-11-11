[![Build Status](https://travis-ci.com/TheSpicyMeatball/js-to-css.svg?branch=master)](https://travis-ci.com/TheSpicyMeatball/js-to-css)
[![Coverage Status](https://coveralls.io/repos/github/TheSpicyMeatball/js-to-css/badge.svg?branch=main)](https://coveralls.io/github/TheSpicyMeatball/js-to-css?branch=main)

# js-to-css

> Generate CSS style sheets from your css-in-js JSON objects

<p>Hello friend.</p>
<p>CSS-in-JS is awesome and powerful, but what do you do if you also have legacy apps to support which can only consume regular CSS?</p>
<p><i>[pause for effect...]</i></p>
<p>Well, that's where <code>js-to-css</code> comes in to save the day!</p>
<p>With <code>js-to-css</code>, you can <i>auto-MAGICALLY</i> deliver classic CSS alongside your CSS-in-JS so your legacy apps can hang around even longer! (just what you've always wanted)</p>

<p><b>Version:</b> 0.0.1</p>


  

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
    </table><p><b>Returns:</b> {CSSFile | CSSFile[]} The generated CSS file content</p><h4>Supporting Types</h4>

```
export type File = {
  // any name that you would like to use as an identifier for the File
  name?: string,

  // optional string to use to prepend all of your classes for scope
  prepend?: string, 

  // optional object with key/value pairs where the keys match the style 
  // object names you want to override and values that are the class 
  // names to use as the overrides
  overrides?: Record<string, string>, 

  // optional object with key/value pairs where the keys match the style 
  // object names you want to affect and values that are the class names
  // to use for the combinators. The value will replace any '&' in your
  // style names.
  combinators?: Record<string, string>,

  // optional array of names of style objects you don't want to include 
  // as part of the output CSS file
  ignore?: string[],

  // optional string representation of the file version to add as part
  // of the class name
  version?: string,

  // object that contains all of your styled objects
  module: Record<string, Record<string, string | number>>,
};

export type CSSFile = {
  // any name that you gave your {File}
  name?: string,
  
  // The CSS file string content
  css: string,
};
```
  <h3>Import</h3>

```
import { jsToCss, CSSFile, File } from 'js-to-css';
```

  <h3>Examples</h3>



<h4>Basic</h4>

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

<h4>Nested Styles &amp; Combinators</h4>
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

<h4>What if my combinators are in separate objects?</h4>
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

<h4>Other Advanced Features</h4>
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

const file = {
  name: 'styles.css',
  prepend: 'test',
  version: '1',
  overrides: {
    somethingElse: '.my-override',
  },
  ignore: ['anotherSomething'],
  module: styles,
};

const cssFile = jsToCss(file);

writeFileSync(join(__dirname, cssFile.name), cssFile.css, 'utf8');
```

<p>The above script will create a file <code>styles.css</code> which contains:</p>

```
.test-v1-something {
  background-color: #fff;
  font-size: 12px;
  padding: 16px;
}

.my-override {
  background-color: #ccc;
  font-size: 10px;
  padding: 8px;
}

.test-v1-one-more {
  border: 1px solid #ccc;
  padding: 16px;
}
```

<p>We have prepended all of our class names with a base class and version <code>.test-v1</code> except for <code>somethingElse</code> which has an override value of <code>.my-override</code>. We've also decided that we don't want to output <code>anotherSomething</code> so it's been added to the <code>ignore</code> list.</p>

<h4>Multiple Files</h4>
<p><code>jsToCss</code> can also handle multiple files at a time. Simply pass in an array of your <code>File</code> objects and you'll get an array of <code>CSSFile</code> objects in return:</p>

```
const files = [file1, file2, file3];
const cssFiles = jsToCss(files);
```



<hr />


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
      └───index.d.ts - 53 Bytes
      └───index.js - 259 Bytes
    └───/jsToCss
      └───index.d.ts - 2.12 KB
      └───index.js - 5.55 KB
  └───/es6
      └───index.d.ts - 53 Bytes
      └───index.js - 38 Bytes
    └───/jsToCss
      └───index.d.ts - 2.12 KB
      └───index.js - 5.28 KB
```

<a href="#license"></a>
<h2>License</h2>

MIT