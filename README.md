# Bindkey
> 绑定键盘快捷键

### Install

```shell
npm i @w-xuefeng/bindkey
```

### Usage

```ts
import { bindkey } from '@w-xuefeng/bindkey';

// 添加快捷键
bindkey.add('Ctrl+C', () => {
  // TODO
});

// 移除快捷键
bindkey.remove('Ctrl+C');
```