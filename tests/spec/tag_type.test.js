/* globals assert, emojify */
/* eslint-env mocha */

'use strict'

describe('emojify with differing tag_types', function () {
  describe('emojify using .replace', function () {
    it('should default to img element', function () {
      var text = ':)'
      var result = emojify.replace(text)
      assert.equal('<img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' />', result)
    })

    it('null tag_type should be img element', function () {
      emojify.setConfig({
        tag_type: null
      })
      var text = ':)'
      var result = emojify.replace(text)
      assert.equal('<img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' />', result)
    })

    it('img tag_type should be well formed', function () {
      emojify.setConfig({
        tag_type: 'img'
      })
      var text = ':)'
      var result = emojify.replace(text)
      assert.equal('<img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' />', result)
    })

    it('div tag_type should be well formed', function () {
      emojify.setConfig({
        tag_type: 'div'
      })
      var text = ':)'
      var result = emojify.replace(text)
      assert.equal('<div class=\'emoji emoji-smile\' title=\':smile:\'></div>', result)
    })
  })

  describe('emojify using .run', function () {
    before(function () {
      this.el = document.createElement('DIV')
    })

    it('null tag_type should be img element', function () {
      emojify.setConfig({
        tag_type: null
      })
      this.el.innerHTML = ':)'
      emojify.run(this.el)

      assert.equal('img', this.el.children[0].tagName.toLowerCase())
    })

    it('img tag_type should be img element', function () {
      emojify.setConfig({
        tag_type: 'img'
      })
      this.el.innerHTML = ':)'
      emojify.run(this.el)
      assert.equal('img', this.el.children[0].tagName.toLowerCase())
    })

    it('div tag_type should be well formed', function () {
      emojify.setConfig({
        tag_type: 'div'
      })
      this.el.innerHTML = ':)'
      emojify.run(this.el)
      var child = this.el.children[0]
      assert.equal('div', child.tagName.toLowerCase())
      assert.equal('emoji emoji-smile', child.className)
      assert.equal(':smile:', child.title)
    })
  })
})
