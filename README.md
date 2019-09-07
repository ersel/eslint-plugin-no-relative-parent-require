# eslint-plugin-no-relative-parent-require

Detects if a module is trying to import from a parent level directory.

```
// this will error because requires from parent directories are disabled
const round = require('../utils/round'); 
```

```
// this will be fine, because relative require is from a child directory
const round = require('./utils/round'); 
```

Usage:

```
npm i eslint-plugin-no-relative-parent-require --save-dev
```

In your `.eslintrc` file

```
"no-relative-parent-require/no-relative-parent-require": "error"
```

If you want to allow certain paths to be imported, you can define exceptions:

```
"no-relative-parent-require/no-relative-parent-require": ["error", ["../../utils"]]
```

Inspired by [eslint-plugin-import/no-relative-parent-imports](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-relative-parent-imports.md).

Published under MIT license, 2019.
