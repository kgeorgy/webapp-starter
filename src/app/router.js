'use strict';
import {TagRouter} from '../lib/router';
import home from './tags/home.tag';
import test from './tags/test.tag';
import notfound from './tags/notfound.tag';

let ctn1Router = new TagRouter('#ctn1', false);

ctn1Router.route('notfound');

ctn1Router.route('/', 'home');

ctn1Router.route('/test/', 'test', (...args) => {
  return {testId: 'TEST MAIN'};
});

ctn1Router.route('/test/*', 'test', (...args) => {
  return {testId: args[0]};
});

let ctn2Router = new TagRouter('#ctn2');

ctn2Router.route('/', 'test', (...args) => {
  return {testId: "Test on home page!"};
});

ctn2Router.route('/test/*', 'home');
