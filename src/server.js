import { has } from './helpers';

export default class {
  constructor({
    actions = {},
    respond = (/* res, req */) => {},
    respondWithError = (/* err, req */) => {},
    filter = () => true,
    transform = r => r,
    errorLogger,
    onTerminate = () => {},
  } = {}) {
    this.actions = actions;
    this.onTerminate = onTerminate;
    this.dispatch = this.dispatch.bind(this);
    this.filter = filter;
    this.transform = transform;
    this.respond = respond;
    this.respondWithError = respondWithError;
    this.errorLogger = errorLogger;
  }

  dispatch(request) {
    if (!this.filter || !this.filter(request)) {
      return false;
    }

    const { args = [], action } = this.transform(request);

    if (!has(this.actions, action)) {
      return false;
    }

    let res;

    try {
      res = this.actions[action](...args);
    } catch (e) {
      this.respondWithError(e.message, request);
      return true;
    }

    if (!(res instanceof Promise)) {
      res = Promise.resolve(res);
    }

    res.then(
      response => this.respond(response, request),
      error => this.respondWithError(error, request),
    );

    return true;
  }

  terminate() {
    this.onTerminate();
  }
}
