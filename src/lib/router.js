'use strict';
import rr from 'riot-route';
import * as r from 'riot'
import {isString} from './utils';

export class TagRouter {

  constructor(appContainer, autoUnmount) {
    this._appContainer = appContainer;
    this._lastTag = null;
    this._routeCtx = rr.create();
    if (autoUnmount === undefined) autoUnmount = true;
    if (autoUnmount) {
      this._routeCtx(() => {
        if (this._lastTag) {
          this._lastTag.unmount(true);
        }
      });
    }
  }

  route(path, tag, argsTransform) {

    // If second args is not string, then the path is empty and the tag is the
    // first arg.
    let emptyPath = !isString(tag);
    if (emptyPath) {
      argsTransform = tag;
      tag = path;
    }
    if (argsTransform === undefined) {
      argsTransform = (...args) => {return {};};
    }
    let handler = (...args) => {
      if (this._lastTag) {
        this._lastTag.unmount(true);
      }
      this._lastTag = r.mount(this._appContainer, tag, argsTransform(...args))[0];
    };
    if (emptyPath) {
      this._routeCtx(handler);
    } else {
      this._routeCtx(path, handler);
    }
  }
}
