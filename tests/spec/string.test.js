/* globals assert, emojify */
/* eslint-env mocha */

'use strict'

describe('emojify used with flat strings', function () {
  describe('with variations of spacing around 2char smileys', function () {
    it('works with no spacing around :)', function () {
      var text = ':)'
      var result = emojify.replace(text)
      assert.equal('<img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' />', result)
    })

    it('works with spacing before :)', function () {
      var text = ' :)'
      var result = emojify.replace(text)
      assert.equal(' <img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' />', result)
    })

    it('works with spacing after :)', function () {
      var text = ':) '
      var result = emojify.replace(text)
      assert.equal('<img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' /> ', result)
    })

    it('works with spacing before and after :)', function () {
      var text = ' :) '
      var result = emojify.replace(text)
      assert.equal(' <img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' /> ', result)
    })

    it('does not insert emoji into the middle of words', function () {
      var text = 'a link for you https://hacks.mozilla.org/2014/06/introducing-the-web-audio-editor-in-firefox-developer-tools/' // `x-d` appears and might be matched in this string
      var result = emojify.replace(text)
      assert.equal(text, result)
    })

    it('does not insert emoji at the end of a word, unless it is at the end', function () {
      var text = 'hey:)'
      var result = emojify.replace(text)
      assert.isTrue(text !== result)

      text = 'hey:) there'
      result = emojify.replace(text)
      assert.equal(text, result)
    })
  })

  describe('with multiple emoji beside each other', function () {
    it('works with multiple :emoji: style', function () {
      var text = ':railway_car::railway_car:'
      var result = emojify.replace(text)
      assert.equal('<img align=\'absmiddle\' alt=\':railway_car:\' class=\'emoji\' src=\'images/emoji/railway_car.png\' title=\':railway_car:\' /><img align=\'absmiddle\' alt=\':railway_car:\' class=\'emoji\' src=\'images/emoji/railway_car.png\' title=\':railway_car:\' />', result)
    })

    it('works with multiple :) style', function () {
      var text = ':):P'
      var result = emojify.replace(text)
      assert.equal('<img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' /><img align=\'absmiddle\' alt=\':stuck_out_tongue_winking_eye:\' class=\'emoji\' src=\'images/emoji/stuck_out_tongue_winking_eye.png\' title=\':stuck_out_tongue_winking_eye:\' />', result)
    })
  })

  describe('isolated cases', function () {
    it(':necktie:', function () {
      var text = ':necktie:'
      var result = emojify.replace(text)
      assert.equal('<img align=\'absmiddle\' alt=\':necktie:\' class=\'emoji\' src=\'images/emoji/necktie.png\' title=\':necktie:\' />', result)
    })

    it('inserts a <3 heart', function () {
      var text = 'inserts a <3 heart'
      var result = emojify.replace(text)
      assert.equal('inserts a <img align=\'absmiddle\' alt=\':heart:\' class=\'emoji\' src=\'images/emoji/heart.png\' title=\':heart:\' /> heart', result)
    })

    it('works on an HTML escaped <3', function () {
      var text = 'inserts a &lt;3 heart'
      var result = emojify.replace(text)
      assert.equal('inserts a <img align=\'absmiddle\' alt=\':heart:\' class=\'emoji\' src=\'images/emoji/heart.png\' title=\':heart:\' /> heart', result)
    })

    it("works on :'(", function () {
      var text = "aww :'( aw :’("
      var result = emojify.replace(text)
      assert.equal('aww <img align=\'absmiddle\' alt=\':sob:\' class=\'emoji\' src=\'images/emoji/sob.png\' title=\':sob:\' /> aw <img align=\'absmiddle\' alt=\':sob:\' class=\'emoji\' src=\'images/emoji/sob.png\' title=\':sob:\' />', result)
    })

    it("works on HTML escaped :'(", function () {
      var text = 'aww :&#x27;( aw'
      var result = emojify.replace(text)
      assert.equal('aww <img align=\'absmiddle\' alt=\':sob:\' class=\'emoji\' src=\'images/emoji/sob.png\' title=\':sob:\' /> aw', result)
    })

    it("I thought it'd run forever", function () {
      var text = "I thought it'd run forever"
      var result = emojify.replace(text)
      assert.equal(text, result)
    })

    it(':) start of string with space emojifies', function () {
      var text = ':) start of string with space'
      var result = emojify.replace(text)
      assert.equal('<img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' /> start of string with space', result)
    })

    it('end of string with space :) emojifies', function () {
      var text = 'end of string with space :)'
      var result = emojify.replace(text)
      assert.equal('end of string with space <img align=\'absmiddle\' alt=\':smile:\' class=\'emoji\' src=\'images/emoji/smile.png\' title=\':smile:\' />', result)
    })

    it("doesn't emojify words ending in `'d`", function () {
      var text = "I&#x27;d better not see emoji in this string; that'd suck"
      var result = emojify.replace(text)
      assert.equal("I&#x27;d better not see emoji in this string; that'd suck", result)
    })

    it('interprets :o and :O', function () {
      var text = ':o :O'
      var result = emojify.replace(text)
      assert.equal("<img align='absmiddle' alt=':open_mouth:' class='emoji' src='images/emoji/open_mouth.png' title=':open_mouth:' /> <img align='absmiddle' alt=':open_mouth:' class='emoji' src='images/emoji/open_mouth.png' title=':open_mouth:' />", result)
    })
  })

  describe('with ignore_emoticons option enabled', function () {
    it('only works on emoji, not emoticons', function () {
      emojify.setConfig({ ignore_emoticons: true })
      var text = ':) :+1: :P :musical_note:'
      var result = emojify.replace(text)
      emojify.setConfig({ ignore_emoticons: false })
      assert.equal(':) <img align=\'absmiddle\' alt=\':thumbsup:\' class=\'emoji\' src=\'images/emoji/thumbsup.png\' title=\':thumbsup:\' /> :P <img align=\'absmiddle\' alt=\':musical_note:\' class=\'emoji\' src=\'images/emoji/musical_note.png\' title=\':musical_note:\' />', result)
    })
  })
})
