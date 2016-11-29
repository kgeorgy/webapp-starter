'use strict';
import {TagRouter} from '../lib/router';
import home from './tags/home.tag';
import test from './tags/test.tag';
import notfound from './tags/notfound.tag';

let ctn1Router = new TagRouter('#main', false);

ctn1Router.route('notfound');

ctn1Router.route('/', 'home');

ctn1Router.route('/test/', 'test', (...args) => {
  return {testId: 'Root of tests'};
});

ctn1Router.route('/test/*', 'test', (...args) => {
  return {testId: args[0]};
});
