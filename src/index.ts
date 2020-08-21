type Replacer = (emoji: string, name: string) => HTMLElement

interface Window {
  NodeFilter: typeof NodeFilter
  document: typeof document
}

const namedEmojiString = /*##EMOJILIST*/'';
const namedEmoji = namedEmojiString.split(/,/);
const namedMatchHash = new Set(namedEmoji);

const emoticons = {
  /* :..: */ named: /:([a-z0-9A-Z_-]+):/,
  /* :-)  */ smile: /:-?\)/g,
  /* :o   */ open_mouth: /:o/gi,
  /* :-o  */ scream: /:-o/gi,
  /* :-]  */ smirk: /[:;]-?]/g,
  /* :-D  */ grinning: /[:;]-?d/gi,
  /* X-D  */ stuck_out_tongue_closed_eyes: /x-d/gi,
  /* ;-p  */ stuck_out_tongue_winking_eye: /[:;]-?p/gi,
  /* :-[ / :-@  */ rage: /:-?[\[@]/g,
  /* :-(  */ frowning: /:-?\(/g,
  /* :'-( */ sob: /:['’]-?\(|:&#x27;\(/g,
  /* :-*  */ kissing_heart: /:-?\*/g,
  /* ;-)  */ wink: /;-?\)/g,
  /* :-/  */ pensive: /:-?\//g,
  /* :-s  */ confounded: /:-?s/gi,
  /* :-|  */ flushed: /:-?\|/g,
  /* :-$  */ relaxed: /:-?\$/g,
  /* :-x  */ mask: /:-x/gi,
  /* <3   */ heart: /<3|&lt;3/g,
  /* </3  */ broken_heart: /<\/3|&lt;&#x2F;3/g,
  /* :+1: */ thumbsup: /:\+1:/g,
  /* :-1: */ thumbsdown: /:\-1:/g,
};
const ignoreModeAvailableKeys = [
  'named', 'thumbsup', 'thumbsdown'
]
const emoticonsProcessed: [RegExp, string][] = Object.keys(emoticons).map(
  key => [(emoticons as any)[key], key],
);

const modeToElementTag = {
  img: 'img',
  sprite: 'span',
  'data-uri': 'span',
};

const modeToElementTagType = (k: keyof typeof modeToElementTag) => {
  return modeToElementTag[k]
}

/* Returns true if the given char is whitespace */
function isWhitespace(s: string) {
  return (
    s === ' ' ||
    s === '\t' ||
    s === '\r' ||
    s === '\n' ||
    s === '' ||
    s === String.fromCharCode(160)
  );
}

type EmojifyConfig = {
  blacklist?: {
    ids: string[];
    classes: string[];
    elements: string[];
  };
  tag_type?: null;
  only_crawl_id?: null;
  img_dir?: string;
  ignore_emoticons?: boolean;
  mode?: keyof typeof modeToElementTag;
};

class Emojify {
  emojiMegaRe?: RegExp;

  defaultConfig: EmojifyConfig = {
    blacklist: {
      ids: [],
      classes: ['no-emojify'],
      elements: ['script', 'textarea', 'a', 'pre', 'code'],
    },
    tag_type: null,
    only_crawl_id: null,
    img_dir: 'images/emoji',
    ignore_emoticons: false,
    mode: 'img',
  };

  config: EmojifyConfig = {};

  Validator: any

  constructor () {
    const Emojifyself = this

    this.Validator = class {
      lastEmojiTerminatedAt = -1;
    
      validate(match: RegExpMatchArray, index: number, input: string) {
        var self = this;
    
        /* Validator */
        var emojiName = Emojifyself.getEmojiNameForMatch(match);
        if (!emojiName) {
          return;
        }
    
        var m = match[0];
        var length = m.length;
        // var index = match.index;
        // var input = match.input;
    
        function success() {
          self.lastEmojiTerminatedAt = length + index;
          return emojiName;
        }
    
        /* At the beginning? */
        if (index === 0) {
          return success();
        }
    
        /* At the end? */
        if (input.length === m.length + index) {
          return success();
        }
    
        var hasEmojiBefore = this.lastEmojiTerminatedAt === index;
        if (hasEmojiBefore) {
          return success();
        }
    
        /* Has a whitespace before? */
        if (isWhitespace(input.charAt(index - 1))) {
          return success();
        }
    
        var hasWhitespaceAfter = isWhitespace(input.charAt(m.length + index));
        /* Has a whitespace after? */
        if (hasWhitespaceAfter && hasEmojiBefore) {
          return success();
        }
    
        return;
      }
    }
  }

  get emoticonsProcessed () {
    if (this.defaultConfig.ignore_emoticons) {
      return emoticonsProcessed.filter(([,k]) => ignoreModeAvailableKeys.includes(k))
    } else {
      return emoticonsProcessed
    }
  }

  initMegaRe() {
    /* The source for our mega-regex */
    const mega = this.emoticonsProcessed
      .map(function(v) {
        var re = v[0];
        var val = re.source || re;
        val = `${val}`.replace(/(^|[^\[])\^/g, '$1');
        return '(' + val + ')';
      })
      .join('|');

    /* The regex used to find emoji */
    return new RegExp(mega, 'gi');
  }

  /* Given an regex match, return the name of the matching emoji */
  getEmojiNameForMatch = (match: RegExpMatchArray) => {
    /* Special case for named emoji */
    if (match[1] && match[2]) {
      var named = match[2];
      if (namedMatchHash.has(named)) {
        return named;
      }
      return;
    }
    for (var i = 3; i < match.length - 1; i++) {
      if (match[i]) {
        return this.emoticonsProcessed[i - 2][1];
      }
    }
  }

  emojifyString = (htmlString: string, replacer: Function) => {
    if (!htmlString) {
      return htmlString;
    }
    if (!replacer) {
      replacer = this.defaultReplacer;
    }

    this.emojiMegaRe = this.initMegaRe();

    var validator = new this.Validator();

    return htmlString.replace(this.emojiMegaRe, (...args) => {
      var matches = Array.prototype.slice.call(args, 0, -2);
      var index = args[args.length - 2];
      var input = args[args.length - 1];
      var emojiName = validator.validate(matches, index, input);
      if (emojiName) {
        return replacer.apply(
          {
            config: this.defaultConfig,
          },
          [args[0], emojiName],
        );
      }
      /* Did not validate, return the original value */
      return args[0];
    });
  }

  defaultReplacer(emoji: string, name: string): string {
    const elementType =
      this.config.tag_type || modeToElementTagType(this.config.mode!);
    if (elementType !== 'img') {
      return `<${elementType} class='emoji emoji-${name}' title=':${name}:'></${elementType}>`;
    } else {
      return `<img align='absmiddle' alt=':${name}:' class='emoji' src='${
        this.config.img_dir
      }/${name}.png' title=':${name}:' />`;
    }
  }

  /* Given a match in a node, replace the text with an image */
  insertEmojicon(args: { node: Text, match: RegExpMatchArray, emojiName: string, replacer: Replacer,
    win: Window }) {
    var emojiElement = null;

    if (args.replacer) {
      emojiElement = args.replacer.apply(
        {
          config: this.defaultConfig,
        },
        [':' + args.emojiName + ':', args.emojiName],
      );
    } else {
      var elementType =
        this.defaultConfig.tag_type ||
        modeToElementTagType(this.defaultConfig.mode!);
      emojiElement = args.win.document.createElement(elementType!);

      if (elementType !== 'img') {
        emojiElement.setAttribute('class', 'emoji emoji-' + args.emojiName);
      } else {
        emojiElement.setAttribute('align', 'absmiddle');
        emojiElement.setAttribute('alt', ':' + args.emojiName + ':');
        emojiElement.setAttribute('class', 'emoji');
        emojiElement.setAttribute(
          'src',
          this.defaultConfig.img_dir + '/' + args.emojiName + '.png',
        );
      }

      emojiElement.setAttribute('title', ':' + args.emojiName + ':');
    }

    args.node.splitText(args.match.index!);
    args.node.nextSibling!.nodeValue = args.node.nextSibling!.nodeValue!.substr(
      args.match[0].length,
      args.node.nextSibling!.nodeValue!.length,
    );
    emojiElement.appendChild(args.node.splitText(args.match.index!));
    args.node.parentNode!.insertBefore(emojiElement, args.node.nextSibling);
  }

  run = (el: Node | null, replacer: Replacer) => {
    this.emojiMegaRe = this.initMegaRe();

    // Check if an element was not passed.
    // This will only work in the browser
    if (typeof el === 'undefined') {
      // Check if an element was configured. If not, default to the body.
      if (this.defaultConfig.only_crawl_id) {
        el = document.getElementById(this.defaultConfig.only_crawl_id!);
      } else {
        el = document.body;
      }
    }

    // Get the window object from the passed element.
    var doc = el!.ownerDocument!,
      win: Window = doc!.defaultView || (doc as any).parentWindow!;

    var treeTraverse = function(parent: Node, cb: Function) {
      var child;

      if (parent.hasChildNodes()) {
        child = parent.firstChild;
        while (child) {
          if (cb(child)) {
            treeTraverse(child, cb);
          }
          child = child.nextSibling;
        }
      }
    };

    const matchAndInsertEmoji = (node: Text) => {
      var match;
      var matches = [];

      var validator = new this.Validator();

      while ((match = this.emojiMegaRe!.exec(node.data)) !== null) {
        if (validator.validate(match, match.index, match.input)) {
          matches.push(match);
        }
      }

      for (var i = matches.length; i-- > 0; ) {
        /* Replace the text with the emoji */
        var emojiName = this.getEmojiNameForMatch(matches[i])!;
        this.insertEmojicon({
          node: node,
          match: matches[i],
          emojiName: emojiName,
          replacer: replacer,
          win: win,
        });
      }
    };

    this.emojiMegaRe = this.initMegaRe();

    var nodes = [];

    var elementsBlacklist = new RegExp(
        this.defaultConfig.blacklist!.elements.join('|'),
        'i',
      ),
      classesBlacklist = new RegExp(
        this.defaultConfig.blacklist!.classes.join('|'),
        'i',
      );

    if (typeof win.document.createTreeWalker !== 'undefined') {
      var nodeIterator = win.document.createTreeWalker(
        el!,
        win.NodeFilter.SHOW_TEXT | win.NodeFilter.SHOW_ELEMENT,
        function(node: HTMLElement) {
          if (node.nodeType !== 1) {
            /* Text Node? Good! */
            return win.NodeFilter.FILTER_ACCEPT;
          }

          if (
            node.tagName.match(elementsBlacklist) ||
            node.tagName === 'svg' ||
            node.className.match(classesBlacklist)
          ) {
            return win.NodeFilter.FILTER_REJECT;
          }

          return win.NodeFilter.FILTER_SKIP;
        } as any,
        false,
      );

      var node;

      while ((node = nodeIterator.nextNode()) !== null) {
        nodes.push(node);
      }
    } else {
      treeTraverse(el!, function(node: HTMLElement) {
        if (
          (typeof node.tagName !== 'undefined' &&
            node.tagName.match(elementsBlacklist)) ||
          (typeof node.className !== 'undefined' &&
            node.className.match(classesBlacklist))
        ) {
          return false;
        }
        if (node.nodeType === 1) {
          return true;
        }

        nodes.push(node);
        return true;
      });
    }

    (nodes as Text[]).forEach(matchAndInsertEmoji);
  }

  setConfig (newConfig: any) {
    Object.keys(this.defaultConfig).forEach((f => {
        if(f in newConfig) {
          (this.defaultConfig as any)[f] = newConfig[f];
        }
    }))
  }
}

const e = new Emojify()

const module = {
  emojify: e,
  defaultConfig: e.defaultConfig,
  emojiNames: namedEmoji,
  setConfig: e.setConfig,
  replace: e.emojifyString,
  run: e.run
}

export const emojify = module.emojify
export const defaultConfig = module.defaultConfig
export const emojiNames = module.emojiNames
export const setConfig = module.setConfig
export const replace = module.replace
export const run = module.run

if (typeof window !== 'undefined') {
  (window as any).emojify = module
}
