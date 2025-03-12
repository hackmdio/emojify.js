import jsdom from "jsdom-global";
import { assert } from "chai";
import emojify from "../dist/js/index.min.js";

jsdom();

global.assert = assert;
global.emojify = emojify
