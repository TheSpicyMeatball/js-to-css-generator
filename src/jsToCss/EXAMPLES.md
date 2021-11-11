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
```

<h4>Multiple Files</h4>
<p><code>jsToCss</code> can also handle multiple files at a time. Simply pass in an array of your <code>File</code> objects:</p>

```
const files = [file1, file2, file3];
const cssFiles = jsToCss(files);
```