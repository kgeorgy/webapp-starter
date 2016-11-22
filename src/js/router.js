'use strict';
import riot from 'riot';
import {ApplicationRouter} from './lib/router';
import home from '../tags/home.tag';
import test from '../tags/test.tag';

let r = new ApplicationRouter('#app');

r.route('/', 'home');

r.route('/test/*', 'test', (...args) => {
  return {testId: args[0]};
});
