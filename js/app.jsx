var Morearty = require('morearty');
var React = window.React = require('react/addons');
var Immutable = require('immutable');

var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var Ctx = Morearty.createContext({});

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
    console.log('app render');
    return (
      <div>
        <h1>App</h1>
        <header>
          <ul>
            <li><Link to="app">Dashboard</Link></li>
            <li><Link to="inbox">Inbox</Link></li>
            <li><Link to="calendar">Calendar</Link></li>
          </ul>
        </header>
        <RouteHandler binding={this.getBinding()} />
      </div>
    );
  }
});

var RouterMoreartyWrapper = React.createClass({
  contextTypes: {
    getRouteAtDepth: React.PropTypes.func.isRequired,
    getRouteComponents: React.PropTypes.func.isRequired,
    routeHandlers: React.PropTypes.array.isRequired
  },

  childContextTypes: {
    makePath: React.PropTypes.func.isRequired,
    makeHref: React.PropTypes.func.isRequired,
    transitionTo: React.PropTypes.func.isRequired,
    replaceWith: React.PropTypes.func.isRequired,
    goBack: React.PropTypes.func.isRequired,
    routeHandlers: React.PropTypes.array.isRequired,
    getCurrentPath: React.PropTypes.func.isRequired,
    getCurrentRoutes: React.PropTypes.func.isRequired,
    getCurrentPathname: React.PropTypes.func.isRequired,
    getCurrentParams: React.PropTypes.func.isRequired,
    getCurrentQuery: React.PropTypes.func.isRequired,
    isActive: React.PropTypes.func.isRequired,
    getRouteAtDepth: React.PropTypes.func.isRequired,
    getRouteComponents: React.PropTypes.func.isRequired
  },

  render: function () {
    console.log('wrapper render');
    var RouteHandlerWithContext = Ctx.bootstrap(RouteHandler, this.context);
    return <RouteHandlerWithContext />;
  }
});

var routes = (
  <Route handler={RouterMoreartyWrapper}>
    <Route name="app" path="/" handler={App}>
      <DefaultRoute handler={Dashboard} />
      <Route name="inbox" handler={Inbox} />
      <Route name="calendar" handler={Calendar}>
        <Route name="foo" handler={Foo} />
      </Route>
    </Route>
  </Route>
);

var b = false;
var i = 0;
Router.run(routes, function (Handler) {
  if (!b) {
    React.render(<Handler />, document.body);
    b = true;
  } else {
    console.log('render');
    Ctx.queueFullUpdate();
    Ctx.getBinding().set('dummy', i++); // ask to re-render
  }
});

module.exports = {
  Ctx: Ctx,
  App: App
};
