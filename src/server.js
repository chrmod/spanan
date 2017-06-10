export default class {

  constructor({
    actions = {},
    respond = (res, req) => {},
    filter = () => true,
    transform = r => r,
    onTerminate = () => {},
  } = {}) {
    this.actions = actions;
    this.onTerminate = onTerminate;
    this.dispatch = this.dispatch.bind(this);
    this.filter = filter;
    this.transform = transform;
    this.respond = respond;
  }

  dispatch(request) {
    if (!this.filter || !this.filter(request)) {
      return false;
    }

    const { args = [], action } = this.transform(request);

    if (!this.actions.hasOwnProperty(action)) {
      return false;
    }

    let res = this.actions[action](...args);

    if (!(res instanceof Promise)) {
      res = Promise.resolve(res);
    }

    res.then((response) => this.respond(response, request));

    return true;
  }

  terminate() {
    this.onTerminate();
  }

}
