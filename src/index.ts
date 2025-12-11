export type ModifierKey = "ctrl" | "shift" | "alt" | "meta";

export type ShortcutOptions = {
  type?: keyof DocumentEventMap | string;
  propagate?: boolean;
  disableInInput?: boolean;
  target?: EventTarget | string | null;
  /**
   * @deprecated 请使用组合键字符串或 KeyboardEvent.key / KeyboardEvent.code 等现代 API
   */
  keycode?: number | false;
};

export type ShortcutBinding = {
  callback: EventListener;
  target: EventTarget;
  event: string;
};

const MODIFIER_KEYS: ModifierKey[] = ["ctrl", "shift", "alt", "meta"];

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  escape: "escape",
  tab: "tab",
  space: "space",
  " ": "space",
  spacebar: "space",
  return: "enter",
  enter: "enter",
  backspace: "backspace",
  insert: "insert",
  home: "home",
  delete: "delete",
  end: "end",
  pageup: "pageup",
  page_up: "pageup",
  pu: "pageup",
  pagedown: "pagedown",
  page_down: "pagedown",
  pd: "pagedown",
  left: "arrowleft",
  arrowleft: "arrowleft",
  up: "arrowup",
  arrowup: "arrowup",
  right: "arrowright",
  arrowright: "arrowright",
  down: "arrowdown",
  arrowdown: "arrowdown",
  cmd: "meta",
  command: "meta",
  control: "ctrl",
  ctrl: "ctrl",
  shift: "shift",
  alt: "alt",
  option: "alt",
  meta: "meta",
  caps_lock: "capslock",
  capslock: "capslock",
  caps: "capslock",
  numlock: "numlock",
  num_lock: "numlock",
  num: "numlock",
  scrolllock: "scrolllock",
  scroll_lock: "scrolllock",
  scroll: "scrolllock",
  pause: "pause",
  break: "pause",
  f1: "f1",
  f2: "f2",
  f3: "f3",
  f4: "f4",
  f5: "f5",
  f6: "f6",
  f7: "f7",
  f8: "f8",
  f9: "f9",
  f10: "f10",
  f11: "f11",
  f12: "f12",
};

const CODE_ALIASES: Record<string, string> = {
  space: "space",
  backspace: "backspace",
  tab: "tab",
  enter: "enter",
  escape: "escape",
  arrowleft: "arrowleft",
  arrowup: "arrowup",
  arrowright: "arrowright",
  arrowdown: "arrowdown",
  insert: "insert",
  delete: "delete",
  home: "home",
  end: "end",
  pageup: "pageup",
  pagedown: "pagedown",
  comma: ",",
  period: ".",
  slash: "/",
  backslash: "\\",
  bracketleft: "[",
  bracketright: "]",
  backquote: "`",
  equal: "=",
  minus: "-",
  semicolon: ";",
  quote: "'",
  numpaddecimal: ".",
  numpaddivide: "/",
  numpadmultiply: "*",
  numpadsubtract: "-",
  numpadadd: "+",
  numpadenter: "enter",
  numlock: "numlock",
  capslock: "capslock",
  pause: "pause",
  controlleft: "ctrl",
  controlright: "ctrl",
  shiftleft: "shift",
  shiftright: "shift",
  altleft: "alt",
  altright: "alt",
  metaleft: "meta",
  metaright: "meta",
};

const LEGACY_KEYCODE_MAP: Record<number, string> = {
  8: "backspace",
  9: "tab",
  13: "enter",
  16: "shift",
  17: "ctrl",
  18: "alt",
  20: "capslock",
  27: "escape",
  32: "space",
  33: "pageup",
  34: "pagedown",
  35: "end",
  36: "home",
  37: "arrowleft",
  38: "arrowup",
  39: "arrowright",
  40: "arrowdown",
  45: "insert",
  46: "delete",
  91: "meta",
  92: "meta",
  93: "meta",
  96: "0",
  97: "1",
  98: "2",
  99: "3",
  100: "4",
  101: "5",
  102: "6",
  103: "7",
  104: "8",
  105: "9",
  106: "*",
  107: "+",
  109: "-",
  110: ".",
  111: "/",
  112: "f1",
  113: "f2",
  114: "f3",
  115: "f4",
  116: "f5",
  117: "f6",
  118: "f7",
  119: "f8",
  120: "f9",
  121: "f10",
  122: "f11",
  123: "f12",
  144: "numlock",
  145: "scrolllock",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'",
};

function isModifierKey(key: string): key is ModifierKey {
  return MODIFIER_KEYS.indexOf(key as ModifierKey) !== -1;
}

function normalizeShortcut(shortcutCombination: string): string {
  return shortcutCombination
    .split("+")
    .map(function (key) {
      return key.trim().toLowerCase();
    })
    .join("+");
}

function normalizeKey(value?: string | null): string {
  if (!value) return "";
  const lower = value.toLowerCase();
  const normalized = lower === " " ? "space" : lower;
  return KEY_ALIASES[normalized] || normalized;
}

function normalizeCode(value?: string | null): string {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (CODE_ALIASES[lower]) {
    return CODE_ALIASES[lower];
  }
  if (lower.indexOf("digit") === 0 && lower.length === 6) {
    return lower.slice(5);
  }
  if (lower.indexOf("numpad") === 0 && lower.length === 7) {
    return lower.slice(6);
  }
  if (lower.indexOf("key") === 0 && lower.length === 4) {
    return lower.slice(3);
  }
  if (/^f(1[0-2]|[1-9])$/.test(lower)) {
    return lower;
  }
  return "";
}

function legacyKeyFromKeycode(keycode?: number | false): string {
  if (typeof keycode !== "number") return "";
  const mapped = LEGACY_KEYCODE_MAP[keycode];
  if (mapped) return mapped;
  return normalizeKey(String.fromCharCode(keycode));
}

function shouldSkipInInput(
  e: KeyboardEvent,
  disableInInput?: boolean,
): boolean {
  if (!disableInInput) return false;
  const rawTarget = e.target || (e as any).srcElement;
  let element = rawTarget as HTMLElement | null;
  if (element && element.nodeType === 3) {
    element = element.parentNode as HTMLElement;
  }
  if (!element || !(element instanceof HTMLElement)) return false;
  const tagName = element.tagName;
  if (!tagName) return false;
  if (element.isContentEditable) return true;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

export class Shortcuts {
  /**
   * 所有快捷键
   */
  allShortcuts: Record<string, ShortcutBinding> = {};

  /**
   * 添加快捷键监听
   * @param shortcutCombination 快捷键（支持组合键）的名称 如 'Ctrl+C'
   * @param callback 快捷键绑定的回调
   * @param opt 设置选项 { type, propagate, disableInInput, target, keycode }
   */
  add(
    shortcutCombination: string,
    callback: (event: KeyboardEvent) => void,
    opt?: ShortcutOptions,
  ) {
    const defaultOptions:
      & Required<Pick<ShortcutOptions, "type" | "propagate" | "disableInInput">>
      & Pick<ShortcutOptions, "target" | "keycode"> = {
        type: "keydown",
        propagate: false,
        disableInInput: false,
      };
    const options = { ...defaultOptions, ...opt };
    const normalizedShortcut = normalizeShortcut(shortcutCombination);
    const keys = normalizedShortcut
      .split("+")
      .map(function (key) {
        return normalizeKey(key);
      })
      .filter(Boolean);

    const ele = this.resolveTarget(options.target);
    const keyFromLegacy = legacyKeyFromKeycode(options.keycode);

    /**
     * keypress 时执行的方法
     * @param e KeyboardEvent 键盘事件参数
     */
    const listener: EventListener = function (event: Event) {
      const e = event as KeyboardEvent;
      if (shouldSkipInInput(e, options.disableInInput)) return;

      const pressedModifiers = {
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
      };

      const eventKey = normalizeKey(e.key);
      const codeKey = normalizeCode(e.code) || eventKey;

      const modifiers = {
        shift: { wanted: false, pressed: pressedModifiers.shift },
        ctrl: { wanted: false, pressed: pressedModifiers.ctrl },
        alt: { wanted: false, pressed: pressedModifiers.alt },
        meta: { wanted: false, pressed: pressedModifiers.meta },
      };

      let matchedKeys = 0;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (isModifierKey(key)) {
          matchedKeys++;
          modifiers[key].wanted = true;
        } else {
          const expectedKey = keyFromLegacy || key;
          if (
            expectedKey && (expectedKey === eventKey || expectedKey === codeKey)
          ) {
            matchedKeys++;
          }
        }
      }

      if (
        matchedKeys === keys.length &&
        modifiers.ctrl.pressed === modifiers.ctrl.wanted &&
        modifiers.shift.pressed === modifiers.shift.wanted &&
        modifiers.alt.pressed === modifiers.alt.wanted &&
        modifiers.meta.pressed === modifiers.meta.wanted
      ) {
        callback(e);
        if (!options.propagate) {
          // 阻止事件传递
          // IE下使用 e.cancelBubble 阻止事件冒泡
          (e as any).cancelBubble = true;
          (e as any).returnValue = false;

          // Firefox 使用 e.stopPropagation 阻止事件冒泡
          if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
          }
          return false;
        }
      }
      return undefined;
    };

    this.allShortcuts[normalizedShortcut] = {
      callback: listener,
      target: ele,
      event: options.type || "keydown",
    };
    // 将函数绑定到事件
    if (ele.addEventListener) {
      ele.addEventListener(options.type || "keydown", listener, false);
    } else if ((ele as any).attachEvent) {
      (ele as any).attachEvent("on" + (options.type || "keydown"), listener);
    } else {
      (ele as any)["on" + (options.type || "keydown")] = listener;
    }
  }

  /**
   * 删除已经绑定的快捷按键
   * @param shortcutCombination 要删除的快捷键的名称 如 'Ctrl+C'
   */
  remove(shortcutCombination: string) {
    const normalizedShortcut = normalizeShortcut(shortcutCombination);
    const binding = this.allShortcuts[normalizedShortcut];
    delete this.allShortcuts[normalizedShortcut];
    if (!binding) return;
    const type = binding.event;
    const ele = binding.target as any;
    const callback = binding.callback as any;

    if (ele.detachEvent) {
      ele.detachEvent("on" + type, callback);
    } else if (ele.removeEventListener) {
      ele.removeEventListener(type, callback, false);
    } else {
      ele["on" + type] = false;
    }
  }

  private resolveTarget(target?: EventTarget | string | null): EventTarget {
    if (typeof target === "string") {
      const found = document.querySelector(target);
      if (found) return found;
      return document;
    }
    if (!target) {
      return document;
    }
    return target;
  }
}

export const bindkey = new Shortcuts();
