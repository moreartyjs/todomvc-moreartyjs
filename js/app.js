var Morearty = require('morearty');
var React = window.React = require('react/addons');
var Router = require('director').Router;
var Immutable = require('immutable');

var NOW_SHOWING = Object.freeze({ ALL: 'all', ACTIVE: 'active', COMPLETED: 'completed' });
var currentId = 2;

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
    var _ = React.DOM;
    return  _.section({ id: 'todoapp' },
      Header({ binding: binding }),
      TodoList({ binding: binding }),
      Footer({ binding: binding })
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
    var _ = React.DOM;
    return _.header({ id: 'header' },
      _.h1(null, 'todos'),
      Morearty.DOM.input({ // requestAnimationFrame-friendly wrapper around input
        id: 'new-todo',
        ref: 'newTodo',
        placeholder: 'What needs to be done?',
        onKeyDown: Morearty.Callback.onEnter(this.onAddTodo)
      })
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
      }).toVector();
    });
  },

  render: function () {
    var binding = this.getDefaultBinding();
    var nowShowing = binding.val('nowShowing');
    var itemsBinding = binding.sub('items');
    var items = itemsBinding.val();

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
      return isShown(item) ? TodoItem({ binding: itemBinding, key: itemBinding.toJS('id') }) : null;
    };

    var allCompleted = !items.find(function (item) {
      return !item.get('completed');
    });

    var _ = React.DOM;
    var ctx = this.getMoreartyContext();
    return _.section({ id: 'main' },
      items.length ?
        Morearty.DOM.input({ id: 'toggle-all', type: 'checkbox', checked: allCompleted, onChange: this.onToggleAll }) :
        null,
      _.ul({ id: 'todo-list' },
        items.map(renderTodo).toArray()
      )
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
    return false;
  },

  onToggleEditing: function (editing) {
    this.getDefaultBinding().set('editing', editing);
    return false;
  },

  onEnter: function (event) {
    this.getDefaultBinding().atomically()
      .set('title', event.target.value)
      .set('editing', false)
      .commit();
    return false;
  },

  render: function () {
    var binding = this.getDefaultBinding();
    var item = binding.val();

    var liClass = React.addons.classSet({
      completed: item.get('completed'),
      editing: item.get('editing')
    });
    var title = item.get('title');

    var _ = React.DOM;
    var ctx = this.getMoreartyContext();
    return _.li({ className: liClass },
      _.div({ className: 'view' },
        Morearty.DOM.input({
          className: 'toggle',
          type: 'checkbox',
          checked: item.get('completed'),
          onChange: this.onToggleCompleted
        }),
        _.label({ onClick: this.onToggleEditing.bind(null, true) }, title),
        _.button({ className: 'destroy', onClick: binding.delete.bind(binding, '') })
      ),
      Morearty.DOM.input({
        className: 'edit',
        ref: 'editField',
        value: title,
        onChange: Morearty.Callback.set(binding, 'title'),
        onKeyDown: Morearty.Callback.onEnter(this.onEnter),
        onBlur: this.onToggleEditing.bind(null, false)
      })
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
      }).toVector();
    });
  },

  render: function () {
    var binding = this.getDefaultBinding();
    var nowShowing = binding.val('nowShowing');

    var items = binding.val('items');
    var completedItemsCount = items.reduce(function (acc, item) {
      return item.get('completed') ? acc + 1 : acc;
    }, 0);

    var _ = React.DOM;
    return _.footer({ id: 'footer' },
      _.span({ id: 'todo-count' }, items.length - completedItemsCount + ' items left'),
      _.ul({ id: 'filters' },
        _.li(null, _.a({ className: nowShowing === NOW_SHOWING.ALL ? 'selected' : '', href: '#/' }, 'All')),
        _.li(null, _.a({ className: nowShowing === NOW_SHOWING.ACTIVE ? 'selected' : '', href: '#/active' }, 'Active')),
        _.li(null, _.a({ className: nowShowing === NOW_SHOWING.COMPLETED ? 'selected' : '', href: '#/completed' }, 'Completed'))
      ),
      completedItemsCount ?
        _.button({ id: 'clear-completed', onClick: this.onClearCompleted },
            'Clear completed (' + completedItemsCount + ')'
        ) :
        null
    );
  }
});

React.renderComponent(
  Bootstrap(),
  document.getElementById('root')
);

