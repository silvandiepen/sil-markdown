# Sil's Vue Markdown Component

What it is? A plugin for Vue to use markdown.
It is different because.. I allows you to use meta data in Markdown files without rendering them but getting them back as data.


### Usage 

In case of nuxt, because that's where I'm using it in..

```npm install @sil/markdown```

- Create a plugin file, for instance `plugins/vue-markdown.js`.
- Load the plugin in the nuxt.config.js in plugins
- Use the component as `<Markdown :content="MyContentFromSomewhere" />`



