/* @flow */

const has = (o, p) => Object.prototype.hasOwnProperty.call(o, p);

type dispatchFn = (r: any) => void;

type responseObj = {|

|}

type requestObj = {|
  action: string,
  args: Array<any>,
|}

type transformFn = requestObj => requestObj;
type respondFn = (responseObj, requestObj) => void;
type filterFn = requestObj => boolean;

type ServerParams = {|
  respond: respondFn,
  filter: filterFn,
  transform: transformFn,
  onTerminate: () => void,
  actions: Map<string, () => void>,
|};

export default class {

  onTerminate: () => void;
  respond: respondFn;
  actions: any;
  transform: transformFn;
  filter: filterFn;
  dispatch: dispatchFn;

  constructor({
    actions = new Map(),
    respond = (/* res, req */) => {},
    filter = () => true,
    transform = r => r,
    onTerminate = () => {},
  }: ServerParams) {
    this.actions = actions;
    this.onTerminate = onTerminate;
    this.dispatch = this.dispatch.bind(this);
    this.filter = filter;
    this.transform = transform;
    this.respond = respond;
  }

  dispatch(request: any) {
    if (!this.filter || !this.filter(request)) {
      return false;
    }

    const { args = [], action } = this.transform(request);

    if (!has(this.actions, action)) {
      return false;
    }

    let res = this.actions[action](...args);

    if (!(res instanceof Promise)) {
      res = Promise.resolve(res);
    }

    res.then(response => this.respond(response, request));

    return true;
  }

  terminate() {
    this.onTerminate();
  }

}
