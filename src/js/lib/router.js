'use strict';
import riot from 'riot';

export class ApplicationRouter {

  constructor(appContainer) {
    this._appContainer = appContainer;
    this._lastTag = null;
  }

  route(route, tag, argsTransform) {
    if (argsTransform === undefined) {
      argsTransform = (...args) => {return {};}; 
    }
    riot.route(route, (...args) => {
      if (this._lastTag) {
        this._lastTag.unmount(true);
      }
      this._lastTag = riot.mount(this._appContainer, tag, argsTransform(...args))[0];
    });
  }

}
