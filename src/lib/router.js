'use strict';
import rr from 'riot-route';
import * as r from 'riot'

export class TagRouter {

  constructor(appContainer) {
    this._appContainer = appContainer;
    this._lastTag = null;
    this._routeCtx = rr.create();
  }

  route(path, tag, argsTransform) {
    if (argsTransform === undefined) {
      argsTransform = (...args) => {return {};};
    }
    this._routeCtx(path, (...args) => {
      if (this._lastTag) {
        this._lastTag.unmount(true);
      }
      this._lastTag = r.mount(this._appContainer, tag, argsTransform(...args))[0];
    });
  }

}
