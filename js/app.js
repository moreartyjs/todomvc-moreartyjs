var Ctx = Morearty.createContext(React, Immutable, {
  nowShowing: 'all',
  items: [{
    title: 'My first task',
    completed: false,
    editing: false
  }]
});

var Bootstrap = Ctx.createClass({
  componentWillMount: function () {
    Ctx.init(this);
  },

  render: function () {
    return App({ state: Ctx.state() });
  }
});

var NOW_SHOWING = Object.freeze({ ALL: 'all', ACTIVE: 'active', COMPLETED: 'completed' });

var App = Ctx.createClass({
  componentDidMount: function () {
    var state = this.getState();
    Router({
      '/': state.set.bind(state, 'nowShowing', NOW_SHOWING.ALL),
      '/active': state.set.bind(state, 'nowShowing', NOW_SHOWING.ACTIVE),
      '/completed': state.set.bind(state, 'nowShowing', NOW_SHOWING.COMPLETED)
    }).init();
  },

  render: function () {
    var state = this.getState();
    var _ = Ctx.React.DOM;
    return  _.section({ id: 'todoapp' },
      Header({ state: state }),
      TodoList({ state: state }),
      Footer({ state: state })
    );
  }
});

var Header = Ctx.createClass({
  componentDidMount: function () {
    this.refs.newTodo.getDOMNode().focus();
  },

  onAddTodo: function (event) {
    var title = event.target.value;
    if (title) {
      this.getState().update('items', function (todos) {
        return todos.push(Ctx.Imm.Map({
          title: title,
          completed: false,
          editing: false
        }));
      });
      event.target.value = '';
    }
  },

  render: function () {
    var _ = Ctx.React.DOM;
    return _.header({ id: 'header' },
      _.h1(null, 'todos'),
      _.input({
        id: 'new-todo',
        ref: 'newTodo',
        placeholder: 'What needs to be done?',
        onKeyPress: Ctx.Callback.onEnter(this.onAddTodo)
      })
    );
  }
});

var TodoList = Ctx.createClass({
  onToggleAll: function (event) {
    var completed = event.target.checked;
    this.getState().update('items', function (items) {
      return items.map(function (item) {
        return item.set('completed', completed);
      }).toVector();
    });
  },

  render: function () {
    var state = this.getState();
    var nowShowing = state.val('nowShowing');
    var itemsBinding = state.sub('items');
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
      return isShown(item) ? TodoItem({ state: itemsBinding.sub(index) }) : null;
    };

    var allCompleted = !items.find(function (item) {
      return !item.get('completed');
    });

    var _ = Ctx.React.DOM;
    return _.section({ id: 'main' },
      items.length ? _.input({ id: 'toggle-all', type: 'checkbox', checked: allCompleted, onChange: this.onToggleAll }) : null,
      _.ul({ id: 'todo-list' },
        items.map(renderTodo).toArray()
      )
    );
  }
});

var TodoItem = Ctx.createClass({
  componentDidUpdate: function () {
    if (Ctx.changed(this.getState().sub('editing'))) {
      var node = this.refs.editField.getDOMNode();
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  },

  onToggleCompleted: function (event) {
    this.getState().set('completed', event.target.checked);
    return false;
  },

  onToggleEditing: function (editing) {
    this.getState().set('editing', editing);
    return false;
  },

  onEnter: function (event) {
    this.getState().atomically()
      .set('title', event.target.value)
      .set('editing', false)
      .commit();
    return false;
  },

  render: function () {
    var state = this.getState();
    var item = state.val();

    var liClass = Ctx.React.addons.classSet({
      completed: item.get('completed'),
      editing: item.get('editing')
    });
    var title = item.get('title');

    var _ = Ctx.React.DOM;
    return _.li({ className: liClass },
      _.div({ className: 'view' },
        _.input({
          className: 'toggle',
          type: 'checkbox',
          checked: item.get('completed'),
          onChange: this.onToggleCompleted
        }),
        _.label({ onClick: this.onToggleEditing.bind(null, true) }, title),
        _.button({ className: 'destroy', onClick: state.delete.bind(state, '') })
      ),
      _.input({
        className: 'edit',
        ref: 'editField',
        value: title,
        onChange: Ctx.Callback.set(state, 'title'),
        onKeyPress: Ctx.Callback.onEnter(this.onEnter),
        onBlur: this.onToggleEditing.bind(null, false)
      })
    )
  }
});

var Footer = Ctx.createClass({
  onClearCompleted: function () {
    this.getState().update('items', function (items) {
      return items.filter(function (item) {
        return !item.get('completed');
      }).toVector();
    });
  },

  render: function () {
    var state = this.getState();
    var nowShowing = state.val('nowShowing');

    var items = state.val('items');
    var completedItemsCount = items.reduce(function (acc, item) {
      return item.get('completed') ? acc + 1 : acc;
    }, 0);

    var _ = Ctx.React.DOM;
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

Ctx.React.renderComponent(
  Bootstrap(),
  document.getElementById('root')
);
