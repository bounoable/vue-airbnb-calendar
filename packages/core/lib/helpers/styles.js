"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
exports.cssVar = (name) => '--dp-' + lodash_1.kebabCase(name);
