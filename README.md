todomvc-moreartyjs
==================

TodoMVC implementation using Morearty.js with webpack and [react-hot-loader](https://github.com/gaearon/react-hot-loader).

Run with `npm run start`. Build standalone app with `npm run build`. Or just [open](https://rawgit.com/moreartyjs/todomvc-moreartyjs/master/index.html) in browser.

To make hot loader work properly with Morearty state put app entry point `React.createClass` call into the same module as state.
