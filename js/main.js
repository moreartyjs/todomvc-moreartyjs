var Morearty = require('morearty');
var Imm = require('immutable');
var React = require('react/addons');
var App = require('./app');

// initial state
var state = {
  nowShowing: 'all',
  items: [{
    id: 1,
    title: 'My first task',
    completed: false,
    editing: false
  }]
};

var Ctx = Morearty.createContext(
  state,
  { // configuration
    requestAnimationFrameEnabled: true
  }
);

var Bootstrap = React.createClass({
  displayName: 'AppRoot',

  componentWillMount: function () {
    Ctx.init(this);
  },

  render: function () {
    return React.withContext({ morearty: Ctx }, function () { // pass Morearty context downside
      return App({ binding: Ctx.getBinding() });              // your App component
    });
  }
});

React.renderComponent(
  Bootstrap(),
  document.getElementById('root')
);
