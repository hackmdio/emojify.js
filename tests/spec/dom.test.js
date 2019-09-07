/* globals assert, emojify */
/* eslint-env mocha */

'use strict'

function assertEmoji (test, rootEl, emojiTitles) {
  var emojis = rootEl.querySelectorAll('.emoji')
  assert.equal(emojiTitles.length, emojis.length)
  for (var i = 0; i < emojis.length; i++) {
    assert.equal(emojiTitles[i], emojis[i].title)
  }
}

describe('emojify on DOM nodes', function () {
  before(function () {
    this.el = document.createElement('DIV')
  })

  after(function () {
    // restore defaults
    emojify.setConfig({
      tag_type: 'img',
      img_dir: 'images/emoji'
    })
  })

  describe('with variations of spacing around 2char smileys', function () {
    it('works with no spacing around :)', function () {
      this.el.innerHTML = ':)'
      emojify.run(this.el)
      assertEmoji(this, this.el, [':smile:'])
    })

    it('works with spacing before :)', function () {
      this.el.innerHTML = ' :)'
      emojify.run(this.el)
      assertEmoji(this, this.el, [':smile:'])
    })

    it('works with spacing after :)', function () {
      this.el.innerHTML = ':) '
      emojify.run(this.el)
      assertEmoji(this, this.el, [':smile:'])
    })

    it('works with spacing before and after :)', function () {
      this.el.innerHTML = ' :) '
      emojify.run(this.el)
      assertEmoji(this, this.el, [':smile:'])
    })
  })

  describe('with multiple emoji beside each other', function () {
    it('works with multiple :emoji: style', function () {
      this.el.innerHTML = ':railway_car::railway_car:'
      emojify.run(this.el)
      assertEmoji(this, this.el, [':railway_car:', ':railway_car:'])
    })
  })

  describe('isolated cases', function () {
    it("it'd", function () {
      this.el.innerHTML = "it'd"
      emojify.run(this.el)
      assert.equal("it'd", this.el.innerHTML)
      assertEmoji(this, this.el, [])
    })

    it('end of string with space :) emojifies', function () {
      this.el.innerHTML = 'end of string with space :)'
      emojify.run(this.el)
      assertEmoji(this, this.el, [':smile:'])
    })

    it(':) start of string with space emojifies', function () {
      this.el.innerHTML = ':) start of string with space'
      emojify.run(this.el)
      assertEmoji(this, this.el, [':smile:'])
    })

    it(':)', function () {
      this.el.innerHTML = ':)'
      emojify.run(this.el)
      var emojis = this.el.querySelectorAll('.emoji')
      assert.equal(1, emojis.length)
      assert.equal(':smile:', emojis[0].title)
    })

    it(':D', function () {
      this.el.innerHTML = ':D'
      emojify.run(this.el)
      assertEmoji(this, this.el, [':grinning:'])
    })

    it(':P', function () {
      this.el.innerHTML = ':P'
      emojify.run(this.el)
      assertEmoji(this, this.el, [':stuck_out_tongue_winking_eye:'])
    })

    it('>:P', function () {
      this.el.innerHTML = '>:P'
      emojify.run(this.el)
      assertEmoji(this, this.el, [':stuck_out_tongue_winking_eye:'])
    })

    it('works with many emojis', function () {
      this.el.innerHTML = ':):):)'
      emojify.run(this.el)
      assertEmoji(this, this.el, [':smile:', ':smile:', ':smile:'])
    })
  })

  describe('ignore cases', function () {
    it('dont emojify inside pre tags', function () {
      this.el.innerHTML = '<pre>:)</pre>'
      emojify.run(this.el)
      assertEmoji(this, this.el, [])
    })

    it('dont emojify inside code tags', function () {
      this.el.innerHTML = '<code>:)</code>'
      emojify.run(this.el)
      assertEmoji(this, this.el, [])
    })
  })

  describe('with custom replacer', function () {
    it('should use custom replacer', function () {
      this.el.innerHTML = '<p>:)</p>'
      emojify.run(this.el, function (emoji, emojiName) {
        var span = document.createElement('span')
        span.className = 'emoji emoji-' + emojiName
        span.innerHTML = emoji
        return span
      })
      var emojis = this.el.querySelectorAll('.emoji')
      assert.equal(1, emojis.length)
      assert.equal('<span class="emoji emoji-smile">:smile:</span>', emojis[0].outerHTML)
    })

    it('ignores some other options when custom replacer is given', function () {
      this.el.innerHTML = '<p>:)</p>'
      emojify.setConfig({
        tag_type: 'div',
        img_dir: 'blah'
      })
      emojify.run(this.el, function (emoji, emojiName) {
        var span = document.createElement('span')
        span.className = 'emoji emoji-' + emojiName
        span.innerHTML = emoji
        return span
      })
      var emojis = this.el.querySelectorAll('.emoji')
      assert.equal(1, emojis.length)
      assert.equal('<span class="emoji emoji-smile">:smile:</span>', emojis[0].outerHTML)
    })
  })
})
