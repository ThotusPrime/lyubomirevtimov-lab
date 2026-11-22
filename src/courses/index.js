/*
 * The lab's courses. Each one has a row on the hub and its own pages under
 * /<slug>/. To add a course, write its module beside this file and add it
 * here; the hub orders the rows by `published`, newest first.
 *
 * Each course exports:
 *   slug       its address, /<slug>/
 *   title      the row's and the course page's title
 *   summary    one or two sentences for its row on the hub
 *   meta       a few short facts for the row's last line
 *   published  the day it went up on the lab, as YYYY-MM-DD
 *   pages      { '': coursePage, 'docs/': ... }, each (url) => Response,
 *              keyed by the path after /<slug>/
 */

import * as troubleshootingAnApi from './troubleshooting-an-api.js';

export const COURSES = [troubleshootingAnApi];
