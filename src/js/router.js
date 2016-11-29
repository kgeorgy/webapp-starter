'use strict';
import {TagRouter} from './lib/router';
import home from '../tags/home.tag';
import test from '../tags/test.tag';

let ctn1Router = new TagRouter('#ctn1');

ctn1Router.route('/', 'home');

ctn1Router.route('/test/*', 'test', (...args) => {
  return {testId: args[0]};
});

let ctn2Router = new TagRouter('#ctn2');

ctn2Router.route('/', 'test', (...args) => {
  return {testId: "Test on home page!"};
});

ctn2Router.route('/test/*', 'home');
