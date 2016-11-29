'use strict';
import * as riot from 'riot';
import rr from 'riot-route';
import r from './router';
import navbar from './tags/navbar.tag';

// Mount default
riot.mount('*');

// Start router
rr.start(true);
