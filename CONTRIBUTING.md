# Contributing

This project follows [Git-Flow](http://nvie.com/posts/a-successful-git-branching-model/), and as such has `master` and `develop` branches.

## Running the tests

- Tests: `npm run test`
- In browser: `npm run test:browser`

## Before creating a pull request

Make sure you do the following:

- Run `npm run build`

Note: The build script will generate new `*.min.{css,js}` files. If, for example, you only changed the JavaScript then don't bother committing `emojify.min.css`.

## Releasing & Publishing

Before a release, generate a commit log:

```
git log --pretty=format:"- %s" >> log.md
```
