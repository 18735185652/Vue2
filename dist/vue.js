(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var oldArrayProtoMethods = Array.prototype; // 不能直接改写数组原有的方法 不可靠，因为只有被vue控制的数组才需要改写

  var arrayMethods = Object.create(Array.prototype); // arrayMethods.__proto__.push

  var methods = ['push', 'pop', 'shift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      var _oldArrayProtoMethods;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 重写数组方法
      // todo ... 
      var result = (_oldArrayProtoMethods = oldArrayProtoMethods[method]).call.apply(_oldArrayProtoMethods, [this].concat(args));

      console.log('todo: array change'); // 有可能用户新增的数据是对象格式 也要进行拦截

      var inserted;

      switch (method) {
        case 'push':
        case 'unshilt':
          inserted = args;
          break;

        case 'splice':
          // splice(0,1,xxx)
          inserted = args.slice(2);
      }

      if (inserted) {
        // observeArray
        this.__ob__.observeArray(inserted);
      }

      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      // 需要对这个value属性重新定义
      // this.data = value;
      // value 可能是对象 可能是数组 ，分类来处理
      Object.defineProperty(value, '__ob__', {
        value: this,
        enumerable: false,
        // 不能被枚举 表示不能被循环
        configurable: false // 不能删除此属性

      });

      if (Array.isArray(value)) {
        // 数组不用defineProperty来进行处理 性能不好
        // push shift reverse sort 我要重写这些方法增加更新逻辑
        value.__proto__ = arrayMethods; // 当是数组时候 改写方法是自己的           
        // Object.setPrototypeOf(value.protptype,arrayMethods)

        this.observeArray(value); //处理原有数组中的对象  Object.freeeze
      } else {
        this.walk(value);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 将对象中所有的key 重新用defineProperty 定义成响应式的
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(value) {
        for (var i = 0; i < value.length; i++) {
          observe(value[i]);
        }
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    // vue2中数据嵌套尽量不要过深 过深浪费性能
    // value 可能也是一个对象
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue); // 如果用户设置的是一个对象 就继续将用户设置的对象变成响应式的

        value = newValue;
      }
    });
  }

  function observe(data) {
    // 只对 对象类型进行观测 非对象类型无法观测
    if (_typeof(data) !== 'object' || data == null) {
      return;
    }

    if (data.__ob__) {
      // 有ob属性说明被观测过了 防止循环引用
      return;
    } // 通过类来对实现数据的观测 类可以方便扩展 会产生实例


    return new Observer(data);
  }

  function initState(vm) {
    // 将所有数据都定义在vm属性上 并且后续更改需要出发视图更新
    var opts = vm.$options; // 获取用户属性

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      // 数据的初始化
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  function initData(vm) {
    // 数据劫持 Object.defineProperty
    var data = vm.$options.data; // 通过vm._data获取劫持后的数据，用户就可以拿到 vm._data

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 将vm._data中的数据全部放到vm上

    for (var key in data) {
      proxy(vm, '_data', key); // vm.name = vm._data.name
    } // 观测这个数据


    observe(data);
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 可以匹配到标签名 [0]

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // [0] 标签的结束名字;

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // console.log(`style='color:"red"'`.match(attribute))

  var startTagClose = /^\s*(\/?)>/;
  // let obj = {
  //     tag:'div',
  //     type:1,
  //     attrs:[{styles:'color:red'}],
  //     children:[
  //         {
  //             tag:'span',
  //             type:1,
  //             attrs:[],
  //             children:[]
  //         }
  //     ],
  //     props:null
  // }
  // vue3里面支持多个根元素(外层加了一个空元素) vue2只支持一个根节点

  function parseHTML(html) {
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: 1,
        chhidren: [],
        attrs: attrs,
        parent: null
      };
    }

    var root = null;
    var currentParent;
    var stack = []; // 根据开始标签 结束标签 文本内容 生成一个ast语法树

    function start(tagName, attrs) {
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element;
      stack.push(element);
    }

    function end(tagName) {
      var element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        element.parent = currentParent;
        currentParent.chhidren.push(element);
      }
    }

    function chars(text) {
      text = text.replace(/\s/g, '');

      if (text) {
        currentParent.chhidren.push({
          type: 3,
          text: text
        });
      }
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); // 获取元素
        // 查找属性

        var _end, attr; // 不是开头标签结尾就一直解析


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }

    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd === 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          //    console.log('开始: ', startTagMatch.tagName);
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } //    console.log('startTagMatch: ', startTagMatch);
        // 结束标签


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length); // console.log('结尾',endTagMatch[1]);

          end(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0;

      if (textEnd > 0) {
        // 开始解析文本
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length); // console.log('text',text);

        chars(text);
      }
    }

    return root;
  }

  function generate(el) {
    console.log('el: ', el);
  }

  function compileToFunctions(template) {
    var ast = parseHTML(template);
    generate(ast); // 生成代码
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 实例上有个属性 $options，表示的是用户传入的所有参数

      initState(vm); //初始化状态

      if (vm.$options.el) {
        // 数据可以挂载到页面上
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      el = document.querySelector(el);
      var vm = this;
      var options = vm.$options; // 如果有render 就直接使用render
      // 没有render 看有没有template属性
      // 没有template 就接着找外部模版

      if (!options.render) {
        var template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        } // 如何将模版编译成render函数 


        var render = compileToFunctions(template);
        options.render = render;
      }
    };
  }

  // Vue2.0 中就是一个构造函数 class

  function Vue(options) {
    console.log('options: ', options);

    this._init(options); // 当用户new Vue时,就调用init方法进行vue的初始方法

  }

  initMixin(Vue); //可以拆分逻辑到不同的文件中 更利于代码维护 模块化的概念
   // 库 => rollup 项目开发webpack

  return Vue;

})));
//# sourceMappingURL=vue.js.map
