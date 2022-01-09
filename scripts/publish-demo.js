const fs = require('fs-extra');
const path = require('path');

fs.copySync(
  path.join('./dist', 'ui'),
  './docs/demo'
);