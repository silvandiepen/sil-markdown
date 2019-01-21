import markdownIt from 'markdown-it';
import meta from 'markdown-it-meta';
import emoji from 'markdown-it-emoji';
import subscript from 'markdown-it-sub';
import superscript from 'markdown-it-sup';
import footnote from 'markdown-it-footnote';
import deflist from 'markdown-it-deflist';
import abbreviation from 'markdown-it-abbr';
import insert from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import toc from 'markdown-it-toc-and-anchor';
import katex from 'markdown-it-katex';
import tasklists from 'markdown-it-task-lists';

//

var script = {
  md: new markdownIt(),
  template: '<div class="markdown"><slot></slot></div>',

  data: function data() {
    return {
      sourceData: this.source,
      metaData: []
    };
  },

  props: {
    watches: {
      type: Array,
      default: function () { return ["source", "show", "toc"]; }
    },
    source: {
      type: String,
      default: ""
    },
    show: {
      type: Boolean,
      default: true
    },
    highlight: {
      type: Boolean,
      default: true
    },
    html: {
      type: Boolean,
      default: true
    },
    xhtmlOut: {
      type: Boolean,
      default: true
    },
    breaks: {
      type: Boolean,
      default: true
    },
    linkify: {
      type: Boolean,
      default: true
    },
    emoji: {
      type: Boolean,
      default: true
    },
    typographer: {
      type: Boolean,
      default: true
    },
    langPrefix: {
      type: String,
      default: "language-"
    },
    meta: {
      type: Boolean,
      default: false
    },
    quotes: {
      type: String,
      default: "“”‘’"
    },
    tableClass: {
      type: String,
      default: "table"
    },
    taskLists: {
      type: Boolean,
      default: true
    },
    toc: {
      type: Boolean,
      default: false
    },
    tocId: {
      type: String
    },
    tocClass: {
      type: String,
      default: "table-of-contents"
    },
    tocFirstLevel: {
      type: Number,
      default: 2
    },
    tocLastLevel: {
      type: Number
    },
    tocAnchorLink: {
      type: Boolean,
      default: true
    },
    tocAnchorClass: {
      type: String,
      default: "toc-anchor"
    },
    tocAnchorLinkSymbol: {
      type: String,
      default: "#"
    },
    tocAnchorLinkSpace: {
      type: Boolean,
      default: true
    },
    tocAnchorLinkClass: {
      type: String,
      default: "toc-anchor-link"
    },
    anchorAttributes: {
      type: Object,
      default: function () { return ({}); }
    },
    prerender: {
      type: Function,
      default: function (sourceData) {
        return sourceData;
      }
    },
    postrender: {
      type: Function,
      default: function (htmlData) {
        return htmlData;
      }
    }
  },
  computed: {
    tocLastLevelComputed: function tocLastLevelComputed() {
      return this.tocLastLevel > this.tocFirstLevel
        ? this.tocLastLevel
        : this.tocFirstLevel + 1;
    }
  },
  methods: {
    renderMeta: function renderMeta(meta$$1, slots, createElement) {
      var _this = this;
      var newContent = [];
      if (Object.keys(meta$$1).length > 0 && slots.default) {
        slots.default.forEach(function (el) {
          if (el.data) {
            Object.keys(meta$$1).forEach(function (tag) {
              var newEl;
              if (el.data.attrs) {
                if (tag === el.data.attrs.meta) {
                  var content = meta$$1[tag];
                  newEl = createElement(el.tag, {
                    props: { value: content, innerHTML: content },
                    domProps: { innerHTML: content }
                  });
                }
              }
              newContent.push(newEl);
            });
          } else {
            newContent.push(el);
          }
        });
      }
      _this.metaData = newContent;
    }
  },

  render: function render(createElement, context) {
    var this$1 = this;

    var _this = this;

    this.md = new markdownIt()
      .use(subscript)
      .use(superscript)
      .use(footnote)
      .use(deflist)
      .use(abbreviation)
      .use(insert)
      .use(mark)
      .use(meta)
      .use(katex, { throwOnError: false, errorColor: " #cc0000" })
      .use(tasklists, { enabled: this.taskLists });

    if (this.emoji) {
      this.md.use(emoji);
    }

    this.md.set({
      html: this.html,
      xhtmlOut: this.xhtmlOut,
      breaks: this.breaks,
      linkify: this.linkify,
      typographer: this.typographer,
      langPrefix: this.langPrefix,
      quotes: this.quotes
    });
    this.md.renderer.rules.table_open = function () { return ("<table class=\"" + (this$1.tableClass) + "\">\n"); };
    var defaultLinkRenderer =
      this.md.renderer.rules.link_open ||
      function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };
    this.md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      Object.keys(this$1.anchorAttributes).map(function (attribute) {
        var aIndex = tokens[idx].attrIndex(attribute);
        var value = this$1.anchorAttributes[attribute];
        if (aIndex < 0) {
          tokens[idx].attrPush([attribute, value]); // add new attribute
        } else {
          tokens[idx].attrs[aIndex][1] = value;
        }
      });
      return defaultLinkRenderer(tokens, idx, options, env, self);
    };

    if (this.toc) {
      this.md.use(toc, {
        tocClassName: this.tocClass,
        tocFirstLevel: this.tocFirstLevel,
        tocLastLevel: this.tocLastLevelComputed,
        anchorLink: this.tocAnchorLink,
        anchorLinkSymbol: this.tocAnchorLinkSymbol,
        anchorLinkSpace: this.tocAnchorLinkSpace,
        anchorClassName: this.tocAnchorClass,
        anchorLinkSymbolClassName: this.tocAnchorLinkClass,
        tocCallback: function (tocMarkdown, tocArray, tocHtml) {
          if (tocHtml) {
            if (this$1.tocId && document.getElementById(this$1.tocId)) {
              document.getElementById(this$1.tocId).innerHTML = tocHtml;
            }

            this$1.$emit("toc-rendered", tocHtml);
          }
        }
      });
    }

    var outHtml = this.show
      ? this.md.render(this.prerender(this.sourceData))
      : "";
    outHtml = this.postrender(outHtml);

    this.$emit("rendered", outHtml);

    var outMeta = _this.renderMeta(this.md.meta, this.$slots, createElement);

    if (this.$props.meta) {
      return createElement("div", this.metaData);
    } else {
      return createElement("div", {
        domProps: {
          innerHTML: outHtml
        }
      });
    }
  },

  beforeMount: function beforeMount() {
    var this$1 = this;

    if (this.$slots.default && !this.$props.meta) {
			this.sourceData = "";
			this.$slots.default.forEach(function (slot) {
        this$1.sourceData += slot.text;				
			});
    }

    this.$watch("source", function () {
      this$1.sourceData = this$1.prerender(this$1.source);
      this$1.$forceUpdate();
    });

    this.watches.forEach(function (v) {
      this$1.$watch(v, function () {
        this$1.$forceUpdate();
      });
    });
  }
};

function normalizeComponent(compiledTemplate, injectStyle, defaultExport, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, isShadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof isShadowMode === 'function') {
        createInjectorSSR = createInjector;
        createInjector = isShadowMode;
        isShadowMode = false;
    }
    // Vue.extend constructor export interop
    var options = typeof defaultExport === 'function' ? defaultExport.options : defaultExport;
    // render functions
    if (compiledTemplate && compiledTemplate.render) {
        options.render = compiledTemplate.render;
        options.staticRenderFns = compiledTemplate.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (injectStyle) {
                injectStyle.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (injectStyle) {
        hook = isShadowMode
            ? function () {
                injectStyle.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
            }
            : function (context) {
                injectStyle.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return defaultExport;
}

/* script */
var __vue_script__ = script;
// For security concerns, we use only base name in production mode. See https://github.com/vuejs/rollup-plugin-vue/issues/258
script.__file = "/Users/silvandiepen/repos/_packages/sil-markdown/src/sil-markdown.vue";

/* template */

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = undefined;
  /* style inject */
  
  /* style inject SSR */
  

  
  var component = normalizeComponent(
    {},
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  )

// Import vue component

// install function executed by Vue.use()
function install(Vue) {
	if (install.installed) { return; }
	install.installed = true;
	Vue.component('silMarkdown', component);
}

// Create module definition for Vue.use()
var plugin = {
	install: install
};

// To auto-install when vue is found
var GlobalVue = null;
if (typeof window !== 'undefined') {
	GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
	GlobalVue = global.Vue;
}
if (GlobalVue) {
	GlobalVue.use(plugin);
}

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;

export default component;
export { install };
