const treeParser = require('../../lib/TreeParser.js');

describe('Tree Parser', () => {
  describe('firstChildByTag', () => {
    let tree;
    let html;
    beforeEach(() => {
      tree = treeParser.parse(`<html>
            <head></head>
            <body></body>
          </html>`);
      html = tree.root.firstChild;
    });
    it('returns first child of tag', () => {
      expect(html.firstChildByTag('body').tagName).toEqual('body');
    });

    it('returns null if there are no children', () => {
      const head = html.children[0];
      expect(head.firstChildByTag('script')).toBe(undefined);
    });
  });

  describe('hasAttribute', () => {
    let node;
    beforeEach(() => {
      const tree = treeParser.parse('<html></html>');
      node = tree.root.firstChild;
    });
    it('false if no attribute with name', () => {
      expect(node.hasAttribute('unknown')).toBe(false);
    });
    it('true if attribute with name', () => {
      node.attribs.amp = 'there';
      expect(node.hasAttribute('amp')).toBe(true);
    });
    it('true if empty attribute', () => {
      node.attribs.amp = '';
      expect(node.hasAttribute('amp')).toBe(true);
    });
  });

  describe('nextNode', () => {
    it('walks depth-first through the dom', () => {
      const tree = treeParser.parse(`<!doctype html>
          <html>
            <head>
              <script></script>
            </head>
            <body>
              <p>Text<span>More text</span></p>
            </body>
          </html>
        `);
      const expectedNodes = [
        'root-root',
        '!doctype-directive',
        'html-tag',
        'head-tag',
        'null-text',
        'script-script',
        'null-text',
        'null-text',
        'body-tag',
        'null-text',
        'p-tag',
        'null-text',
        'span-tag',
        'null-text',
        'null-text'
      ];
      expect(traverse(tree)).toEqual(expectedNodes);
    });
  });

  describe('insertBefore', () => {
    let tree;
    let body;
    beforeEach(() => {
      tree = treeParser.parse(`
      <html>
        <body>
          <first-tag></first-tag>
          <second-tag></second-tag>
        </body>
      </html>`);
      const html = tree.root.firstChild;
      body = html.firstChildByTag('body');
    });

    it('Inserts a node in the correct place', () => {
      const newTag = tree.createElement('newtag');
      const secondTag = body.firstChildByTag('second-tag');
      body.insertBefore(newTag, secondTag);
      expect(secondTag.prev.tagName).toEqual('newtag');
    });

    it('Inserts node at the end when secondTag is null', () => {
      const newTag = tree.createElement('newtag');
      body.insertBefore(newTag, null);
      expect(body.lastChild.tagName).toEqual('newtag');
    });
  });
});

describe('Tree', () => {
  let tree = treeParser.parse('<html><head></head></html>');
  describe('createElement', () => {
    it('works without attributes', () => {
      const element = tree.createElement('test');
      expect(element.tagName).toBe('test');
    });
    it('works with attributes', () => {
      const element = tree.createElement('test', {myAttribute: 'hello'});
      expect(element.attribs.myAttribute).toBe('hello');
    });
  });
  describe('createTextNode', () => {
    it('sets data', () => {
      const textNode = tree.createTextNode('test');
      expect(textNode.data).toBe('test');
    });
  });
  describe('appendChild', () => {
    let firstElement;
    let secondElement;
    let head;
    beforeEach(() => {
      let tree = treeParser.parse('<html><head></head></html>');
      head = tree.root.firstChild.firstChild;

      firstElement = tree.createElement('meta');
      head.appendChild(firstElement);

      secondElement = tree.createElement('script');
      head.appendChild(secondElement);
    });
    it('appends child', () => {
      expect(head.firstChild).toBe(firstElement);
    });
    it('sets previous', () => {
      expect(head.children[1].prev).toBe(firstElement);
    });
    it('sets next', () => {
      expect(head.firstChild.next).toBe(secondElement);
    });
  });
});

function traverse(tree) {
  const traversedNodes = [];
  let node = tree.root;
  while (node) {
    traversedNodes.push(node.tagName + '-' + node.type);
    node = node.nextNode();
  }
  return traversedNodes;
}