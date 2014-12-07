var React = require('react');
var app = require('./app');
var App = app.App, Ctx = app.Ctx;

var Bootstrap = React.createFactory(Ctx.bootstrap(App));

React.render(
  Bootstrap(),
  document.getElementById('root')
);
