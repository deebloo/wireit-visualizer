# Wireit Visualizer

Wireit Visualizer gives you the ability to generate a graph visualization of your build configuration.

```bash
npx wireit-visualizer@latest --open
```

## Options

| name   | short | description       | default |
| ------ | ----- | ----------------- | ------- |
| --port | -p    | server port       | 4200    |
| --open | -o    | auto open browser | false   |

This repo generats the following graph

```mermaid
graph LR
  :start[:start]-->:build[:build]
  :build[:build]-->:graphviz[:graphviz]
  :test[:test]-->:build[:build]
  :tsc[:tsc]-->mock/core:build[mock/core:build]
  :build[:build]-->:mermaid[:mermaid]
  mock/core:build[mock/core:build]-->mock/core:tsc[mock/core:tsc]
  :build[:build]-->:shoelace[:shoelace]
  :build[:build]-->:tsc[:tsc]
  :start[:start]-->mock/common:build[mock/common:build]
  mock/common:build[mock/common:build]-->mock/core:build[mock/core:build]
  mock/common:build[mock/common:build]-->mock/common:css[mock/common:css]

```

This repo is a POC for the following issue filed on the wireit repo. https://github.com/google/wireit/issues/977
