var Morearty = require('morearty');
var React = window.React = require('react/addons');
var Immutable = require('immutable');

var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;

var Ctx = Morearty.createContext({
  options: {
    renderOnce: true
  }
});

var Dashboard = React.createClass({
  mixins: [Morearty.Mixin],
  render: function () {
    return (
      <div>
        Dashboard
      </div>
    );
  }
});

var Inbox = React.createClass({
  mixins: [Morearty.Mixin],
  render: function () {
    return (
      <div>
        Inbox
      </div>
    );
  }
});

var Calendar = React.createClass({
  mixins: [Morearty.Mixin],
  render: function () {
    return (
      <div>
        Calendar
      </div>
    );
  }
});

var Foo = React.createClass({
  mixins: [Morearty.Mixin],
  render: function () {
    return (
      <div>
        Foo
      </div>
    );
  }
});

var App = React.createClass({
  mixins: [Morearty.Mixin],
  render: function () {
    return (
      <div>
        <h1>App</h1>
        <RouteHandler />
      </div>
    );
  }
});

var routes = (
  <Route name="app" path="/" handler={Ctx.bootstrap(App)}>
    <DefaultRoute handler={Dashboard} />
    <Route name="inbox" handler={Inbox} />
    <Route name="calendar" handler={Calendar}>
      <Route name="foo" handler={Foo} />
    </Route>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler />, document.body);
  console.log('!!!');
});

module.exports = {
  Ctx: Ctx,
  App: App
};
