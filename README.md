# Bindkey
> 绑定键盘快捷键

### Install

```shell
npm i @w-xuefeng/bindkey
```

### Usage

```ts
import { bindkey, type ShortcutOptions } from '@w-xuefeng/bindkey';

const options: ShortcutOptions = { propagate: false }

// 添加快捷键
bindkey.add('Ctrl+C', () => {
  // TODO
}, options);

// 移除快捷键
bindkey.remove('Ctrl+C');
```