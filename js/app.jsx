var Morearty = require('morearty');
var React = window.React = require('react/addons');
var Router = require('director').Router;
var Immutable = require('immutable');

var NOW_SHOWING = Object.freeze({ ALL: 'all', ACTIVE: 'active', COMPLETED: 'completed' });
var currentId = 2;
var Bootstrap;

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

var Ctx = Morearty.createContext(state);

var App = React.createClass({
  displayName: 'App',

  mixins: [Morearty.Mixin],

  componentDidMount: function () {
    var binding = this.getDefaultBinding();
    Router({
      '/': binding.set.bind(binding, 'nowShowing', NOW_SHOWING.ALL),
      '/active': binding.set.bind(binding, 'nowShowing', NOW_SHOWING.ACTIVE),
      '/completed': binding.set.bind(binding, 'nowShowing', NOW_SHOWING.COMPLETED)
    }).init();
  },

  render: function () {
    var binding = this.getDefaultBinding();
    return (
      <section id='todoapp'>
        <Header binding={ binding } />
        <TodoList binding={ binding } />
        <Footer binding={ binding } />
      </section>
    );
  }
});

var Header = React.createClass({
  displayName: 'Header',
  mixins: [Morearty.Mixin],

  componentDidMount: function () {
    this.refs.newTodo.getDOMNode().focus(); // focus on show
  },

  onAddTodo: function (event) {
    var title = event.target.value;
    if (title) {
      this.getDefaultBinding().update('items', function (todos) { // add new item
        return todos.push(Immutable.Map({
          id: currentId++,
          title: title,
          completed: false,
          editing: false
        }));
      });
      event.target.value = '';
    }
  },

  render: function () {
    return (
      <header id='header'>
        <h1>todos</h1>
        <Morearty.DOM.input id='new-todo' // requestAnimationFrame-friendly wrapper around input
                            ref='newTodo'
                            placeholder='What needs to be done?'
                            onKeyDown={ Morearty.Callback.onEnter(this.onAddTodo) } />
      </header>
    );
  }
});

var TodoList = React.createClass({
  displayName: 'TodoList',

  mixins: [Morearty.Mixin],

  onToggleAll: function (event) {
    var completed = event.target.checked;
    this.getDefaultBinding().update('items', function (items) {
      return items.map(function (item) {
        return item.set('completed', completed);
      });
    });
  },

  render: function () {
    var binding = this.getDefaultBinding();
    var nowShowing = binding.get('nowShowing');
    var itemsBinding = binding.sub('items');
    var items = itemsBinding.get();

    var isShown = function (item) {
      switch (nowShowing) {
        case NOW_SHOWING.ALL:
          return true;
        case NOW_SHOWING.ACTIVE:
          return !item.get('completed');
        case NOW_SHOWING.COMPLETED:
          return item.get('completed');
      }
    };

    var renderTodo = function (item, index) {
      var itemBinding = itemsBinding.sub(index);
      return isShown(item) ? <TodoItem binding={ itemBinding} key={ itemBinding.toJS('id') } /> : null;
    };

    var allCompleted = !items.find(function (item) {
      return !item.get('completed');
    });

    return (
      <section id='main'>
      {
        items.count() ?
          <Morearty.DOM.input id='toggle-all'
                              type='checkbox'
                              checked={ allCompleted }
                              onChange={ this.onToggleAll } /> :
          null
      }
        <ul id='todo-list'>{ items.map(renderTodo).toArray() }</ul>
      </section>
    );
  }
});

var TodoItem = React.createClass({
  displayName: 'TodoItem',

  mixins: [Morearty.Mixin],

  componentDidUpdate: function () {
    var ctx = this.getMoreartyContext();
    if (ctx.isChanged(this.getDefaultBinding().sub('editing'))) {
      var node = this.refs.editField.getDOMNode();
      node.focus();
      node.setSelectionRange(0, node.value.length);
    }
  },

  onToggleCompleted: function (event) {
    this.getDefaultBinding().set('completed', event.target.checked);
  },

  onToggleEditing: function (editing) {
    this.getDefaultBinding().set('editing', editing);
  },

  onEnter: function (event) {
    this.getDefaultBinding().atomically()
      .set('title', event.target.value)
      .set('editing', false)
      .commit();
  },

  render: function () {
    var binding = this.getDefaultBinding();
    var item = binding.get();

    var liClass = React.addons.classSet({
      completed: item.get('completed'),
      editing: item.get('editing')
    });
    var title = item.get('title');

    return (
      <li className={ liClass }>
        <div className='view'>
          <Morearty.DOM.input className='toggle'
                              type='checkbox'
                              checked={ item.get('completed') }
                              onChange={ this.onToggleCompleted } />
          <label onClick={ this.onToggleEditing.bind(null, true) }>{ title }</label>
          <button className='destroy' onClick={ binding.delete.bind(binding, '') }></button>
        </div>
        <Morearty.DOM.input className='edit'
                            ref='editField'
                            value={ title }
                            onChange={ Morearty.Callback.set(binding, 'title') }
                            onKeyDown={ Morearty.Callback.onEnter(this.onEnter) }
                            onBlur={ this.onToggleEditing.bind(null, false) } />
      </li>
    );
  }
});

var Footer = React.createClass({
  displayName: 'Footer',

  mixins: [Morearty.Mixin],

  onClearCompleted: function () {
    this.getDefaultBinding().update('items', function (items) {
      return items.filter(function (item) {
        return !item.get('completed');
      });
    });
  },

  render: function () {
    var binding = this.getDefaultBinding();
    var nowShowing = binding.get('nowShowing');

    var items = binding.get('items');
    var completedItemsCount = items.reduce(function (acc, item) {
      return item.get('completed') ? acc + 1 : acc;
    }, 0);

    return (
      <footer id='footer'>
        <span id='todo-count'>{ items.count() - completedItemsCount + ' items left' }</span>
        <ul id='filters'>
          <li>
            <a className={ nowShowing === NOW_SHOWING.ALL ? 'selected' : '' } href='#/'>All</a>
          </li>
          <li>
            <a className={ nowShowing === NOW_SHOWING.ACTIVE ? 'selected' : '' } href='#/active'>Active</a>
          </li>
          <li>
            <a className={ nowShowing === NOW_SHOWING.COMPLETED ? 'selected' : '' } href='#/completed'>Completed</a>
          </li>
        </ul>
      {
        completedItemsCount ?
          <button id='clear-completed' onClick={ this.onClearCompleted }>
            { 'Clear completed (' + completedItemsCount + ')' }
          </button> :
          null
      }
      </footer>
    );
  }
});

module.exports = {
  Ctx: Ctx,
  App: App
};
