/* globals assert, emojify */
/* eslint-env mocha */

'use strict'

describe('emojify in different modes', function () {
  beforeEach(function () {
    this.el = document.createElement('DIV')
  })

  describe('emojify without a specified mode', function () {
    it('should default to img mode', function () {
      var text = ':)'
      this.el.innerHTML = text
      emojify.run(this.el)
      assert.equal('img', this.el.children[0].tagName.toLowerCase())
    })
  })

  describe('emojify in sprite mode', function () {
    describe('using .run', function () {
      it('should generate spans with classes', function () {
        var text = ':)'
        const el = document.createElement('div')
        el.innerHTML = text
        emojify.setConfig({
          mode: 'sprite'
        })
        emojify.run(el)
        var child = el.children[0]
        assert.equal('span', child.tagName.toLowerCase())
        assert.equal('emoji emoji-smile', child.className)
        assert.equal(':smile:', child.title)
      })

      it('should still accept a custom renderer', function () {
        var text = ':)'
        this.el.innerHTML = text
        emojify.setConfig({
          mode: 'sprite'
        })
        emojify.run(this.el, function (emoji, emojiName) {
          var paragraph = document.createElement('p')
          paragraph.innerHTML = emoji + ' found (' + emojiName + ')'
          return paragraph
        })
        assert.equal('<p>:smile: found (smile)</p>', this.el.innerHTML)
      })

      it('should still accept a custom tag type', function () {
        var text = ':)'
        this.el.innerHTML = text
        emojify.setConfig({
          tag_type: 'blah',
          mode: 'sprite'
        })
        emojify.run(this.el)
        assert.equal('blah', this.el.children[0].tagName.toLowerCase())
      })
    })

    describe('using .replace', function () {
      it('should generate spans', function () {
        var text = ':)'

        emojify.setConfig({
          tag_type: null,
          mode: 'sprite'
        })
        var result = emojify.replace(text)
        assert.equal('<span class=\'emoji emoji-smile\' title=\':smile:\'></span>', result)
      })

      it('should still accept a custom renderer', function () {
        var text = ':)'
        emojify.setConfig({
          mode: 'sprite'
        })
        var result = emojify.replace(text, function (emoji, emojiName) {
          return '<blah> ' + emoji + ' found (' + emojiName + ')</blah>'
        })
        assert.equal('<blah> :) found (smile)</blah>', result)
      })

      it('should still accept a custom tag type', function () {
        var text = ':)'
        emojify.setConfig({
          tag_type: 'blah',
          mode: 'sprite'
        })
        var result = emojify.replace(text)
        assert.equal('<blah class=\'emoji emoji-smile\' title=\':smile:\'></blah>', result)
      })
    })
  })

  describe('emojify in data-URI mode', function () {
    describe('using .run', function () {
      it('should generate spans with classes', function () {
        var text = ':)'
        this.el.innerHTML = text
        emojify.setConfig({
          tag_type: null,
          mode: 'data-uri'
        })
        emojify.run(this.el)
        var child = this.el.children[0]
        assert.equal('span', child.tagName.toLowerCase())
        assert.equal('emoji emoji-smile', child.className)
        assert.equal(':smile:', child.title)
      })

      it('should still accept a custom renderer', function () {
        var text = ':)'
        this.el.innerHTML = text
        emojify.setConfig({
          mode: 'data-uri'
        })
        emojify.run(this.el, function (emoji, emojiName) {
          var paragraph = document.createElement('p')
          paragraph.innerHTML = emoji + ' found (' + emojiName + ')'
          return paragraph
        })
        assert.equal('<p>:smile: found (smile)</p>', this.el.innerHTML)
      })

      it('should still accept a custom tag type', function () {
        var text = ':)'
        this.el.innerHTML = text
        emojify.setConfig({
          tag_type: 'blah',
          mode: 'data-uri'
        })
        emojify.run(this.el)
        assert.equal('blah', this.el.children[0].tagName.toLowerCase())
      })
    })

    describe('using .replace', function () {
      it('should generate spans', function () {
        var text = ':)'

        emojify.setConfig({
          tag_type: null,
          mode: 'data-uri'
        })
        var result = emojify.replace(text)
        assert.equal('<span class=\'emoji emoji-smile\' title=\':smile:\'></span>', result)
      })

      it('should still accept a custom renderer', function () {
        var text = ':)'

        emojify.setConfig({
          mode: 'data-uri'
        })
        var result = emojify.replace(text, function (emoji, emojiName) {
          return '<blah> ' + emoji + ' found (' + emojiName + ')</blah>'
        })
        assert.equal('<blah> :) found (smile)</blah>', result)
      })

      it('should still accept a custom tag type', function () {
        var text = ':)'
        emojify.setConfig({
          tag_type: 'blah',
          mode: 'data-uri'
        })
        var result = emojify.replace(text)
        assert.equal('<blah class=\'emoji emoji-smile\' title=\':smile:\'></blah>', result)
      })
    })
  })
})
