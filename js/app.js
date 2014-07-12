var Ctx = Morearty.createContext(React, {
    nowShowing: 'all',
    items: [{
      title: 'My first task',
      completed: false,
      editing: false
    }]
  }, {
    requestAnimationFrameEnabled: true
  }
);

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
      '/': state.assoc.bind(state, 'nowShowing', NOW_SHOWING.ALL),
      '/active': state.assoc.bind(state, 'nowShowing', NOW_SHOWING.ACTIVE),
      '/completed': state.assoc.bind(state, 'nowShowing', NOW_SHOWING.COMPLETED)
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
        return todos.append(Ctx.Data.Map.fill(
          'title', title,
          'completed', false,
          'editing', false
        ));
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
        return item.assoc('completed', completed);
      });
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
      items.size() ? _.input({ id: 'toggle-all', type: 'checkbox', checked: allCompleted, onChange: this.onToggleAll }) : null,
      _.ul({ id: 'todo-list' },
        items.map(renderTodo).toArray()
      )
    );
  }
});

var TodoItem = Ctx.createClass({
  componentDidUpdate: function () {
    if (this.getState().val('editing')) {
      var node = this.refs.editField.getDOMNode();
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  },

  onToggleCompleted: function (event) {
    this.getState().assoc('completed', event.target.checked);
    return false;
  },

  onToggleEditing: function () {
    this.getState().update('editing', Ctx.Util.not);
    return false;
  },

  onEnter: function (event) {
    this.getState().atomically()
      .assoc('title', event.target.value)
      .assoc('editing', false)
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
        _.label({ onClick: this.onToggleEditing }, title),
        _.button({ className: 'destroy', onClick: state.dissoc.bind(state, '') })
      ),
      _.input({
        className: 'edit',
        ref: 'editField',
        value: title,
        onChange: Ctx.Callback.assoc(state, 'title'),
        onKeyPress: Ctx.Callback.onEnter(this.onEnter),
        onBlur: this.onToggleEditing
      })
    )
  }
});

var Footer = Ctx.createClass({
  onClearCompleted: function () {
    this.getState().update('items', function (items) {
      return items.filter(function (item) {
        return !item.get('completed');
      });
    });
  },

  render: function () {
    var state = this.getState();
    var nowShowing = state.val('nowShowing');

    var items = state.val('items');
    var completedItems = items.filter(function (item) {
      return item.get('completed');
    });
    var completedItemsCount = completedItems.size();

    var _ = Ctx.React.DOM;
    return _.footer({ id: 'footer' },
      _.span({ id: 'todo-count' }, items.size() - completedItemsCount + ' items left'),
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
