# Changelog

## [3.1.2](https://github.com/jharvey10/gh-notification-manager/compare/v3.1.1...v3.1.2) (2026-04-17)


### Bug Fixes

* Adjust activity labels ([cc76093](https://github.com/jharvey10/gh-notification-manager/commit/cc76093e47f8402f65932bd0446b5fa60c2c834c))

## [3.1.1](https://github.com/jharvey10/gh-notification-manager/compare/v3.1.0...v3.1.1) (2026-04-17)


### Bug Fixes

* Allow deleted notifications to reappear on new activity ([b6fbdde](https://github.com/jharvey10/gh-notification-manager/commit/b6fbdde6afaa7e3939514a3d34226d5abcf9be1c))
* re-add super necessary emoji ([18fb749](https://github.com/jharvey10/gh-notification-manager/commit/18fb7497948d87cf3df792685a591a4f3e0e55cd))

## [3.1.0](https://github.com/jharvey10/gh-notification-manager/compare/v3.0.1...v3.1.0) (2026-04-15)


### Features

* add configurable pr size labels ([8e9d552](https://github.com/jharvey10/gh-notification-manager/commit/8e9d552c3869ed2987b62b7815f37cc354674388))

## [3.0.1](https://github.com/jharvey10/gh-notification-manager/compare/v3.0.0...v3.0.1) (2026-04-15)


### Bug Fixes

* re-add missing checksuite tags ([5ed934d](https://github.com/jharvey10/gh-notification-manager/commit/5ed934d01072364c3350982638a0cc03b664d356))

## [3.0.0](https://github.com/jharvey10/gh-notification-manager/compare/v2.1.1...v3.0.0) (2026-04-15)


### ⚠ BREAKING CHANGES

* unread state, saved state, archived state, are all managed locally and separate from github.com. a best effort is made to mirror the state on github, but the app is considered the definitive source which does not transfer 1-to-1 to external views of the notifications.

### Features

* large refactor to accommodate github api removals ([40b11d9](https://github.com/jharvey10/gh-notification-manager/commit/40b11d969f0d23938dfc4b07d9348bc3bccc52bf))

## [2.1.1](https://github.com/jharvey10/gh-notification-manager/compare/v2.1.0...v2.1.1) (2026-04-13)


### Bug Fixes

* allow retry of existing token on error ([3852053](https://github.com/jharvey10/gh-notification-manager/commit/3852053d00781708b0044d4e9d4eb8e3780c9435))
* update minor deps ([0bee79a](https://github.com/jharvey10/gh-notification-manager/commit/0bee79a0b46b6374005a5445b7862064080a8391))

## [2.1.0](https://github.com/jharvey10/gh-notification-manager/compare/v2.0.0...v2.1.0) (2026-04-03)


### Features

* add better tagging of checksuite notifications ([b698ae0](https://github.com/jharvey10/gh-notification-manager/commit/b698ae008e4fbbae4d465c306c34c3304205c854))


### Bug Fixes

* fix bug with full refresh removing almost all notifications ([151a1f2](https://github.com/jharvey10/gh-notification-manager/commit/151a1f2f8c99ff50d52bda3f061f84b51687b5d4))
* include "closed" in state for junk tags in addition to "merged" ([4ee5891](https://github.com/jharvey10/gh-notification-manager/commit/4ee58917061934208a4b66df2926988106fbd7a3))
* remove extraneous notifications update broadcast ([4ee5891](https://github.com/jharvey10/gh-notification-manager/commit/4ee58917061934208a4b66df2926988106fbd7a3))

## [2.0.0](https://github.com/jharvey10/gh-notification-manager/compare/v1.5.0...v2.0.0) (2026-04-02)


### ⚠ BREAKING CHANGES

* The app now tracks read, unread, and saved as local state that is not reflected on github. This means there is not congruency between notification state in the app and notification state on github.com until there are sufficient public APIs available to have that.
* This fundamentally changes the way the app updates and is experimental

### Features

* get self-update actually working ([1e91f93](https://github.com/jharvey10/gh-notification-manager/commit/1e91f933d01ffc5bfb4dfe45d638fe23de580547))
* implement bootstrap-based app bundle running ([deed46e](https://github.com/jharvey10/gh-notification-manager/commit/deed46e03339804c4ea529aa7d9023077fb7397e))
* remove usages of graphql notifications-based queries ([dc65935](https://github.com/jharvey10/gh-notification-manager/commit/dc65935cd435f73f337647d24c9c755763b85609))
* self-updater ([8e3d1ab](https://github.com/jharvey10/gh-notification-manager/commit/8e3d1ab755c2f370b1fddbaf46e84dc910e54bf5))


### Bug Fixes

* adjust build process ([e4e084e](https://github.com/jharvey10/gh-notification-manager/commit/e4e084ec490a70c500885d22f9c42c086d80d389))
* **deps:** update dependency minor versions ([50a78f0](https://github.com/jharvey10/gh-notification-manager/commit/50a78f0a432ffd17959ffcc31c8bd48906594108))
* fix broken import path for index.html when loaded from bundle ([0f39442](https://github.com/jharvey10/gh-notification-manager/commit/0f39442d09f39f289ff33b46563e86e429efd28f))
* fix incorrect artifact names ([81a1788](https://github.com/jharvey10/gh-notification-manager/commit/81a178889e46459ea41cef4357d8dae478569017))

## [1.5.0](https://github.com/jharvey10/gh-notification-manager/compare/v1.4.1...v1.5.0) (2026-03-31)

### Features

* Show errors in dismissable alerts at bottom of screen ([61311e6](https://github.com/jharvey10/gh-notification-manager/commit/61311e652f634ab76bbd4da651c1c711d4e11bcf))


### Bug Fixes

* add missing reason tags ([c9924a7](https://github.com/jharvey10/gh-notification-manager/commit/c9924a7e85f7e7f892ed8fe0736ed0e362337667))
* improve onboarding logic and token validation ([d5b75dc](https://github.com/jharvey10/gh-notification-manager/commit/d5b75dcc7f55aef78074044a1cb23f7560b23a4e))

## [1.4.1](https://github.com/jharvey10/gh-notification-manager/compare/v1.4.0...v1.4.1) (2026-03-26)


### Bug Fixes

* don't show "mentioned" if the mentioned user isn't you ([f39e50e](https://github.com/jharvey10/gh-notification-manager/commit/f39e50e99a3d44d5c0ba7294eb6d9e3eecb2597b))

## [1.4.0](https://github.com/jharvey10/gh-notification-manager/compare/v1.3.2...v1.4.0) (2026-03-26)


### Features

* Add batch action progress bar ([1694a70](https://github.com/jharvey10/gh-notification-manager/commit/1694a70bffc8501d88cf31e49c8e253aedac6282))


### Bug Fixes

* **deps:** bump picomatch from 4.0.3 to 4.0.4 ([bc70c9a](https://github.com/jharvey10/gh-notification-manager/commit/bc70c9ac69be6cc527bebcb0a3204cd37cc061e8))

## [1.3.2](https://github.com/jharvey10/gh-notification-manager/compare/v1.3.1...v1.3.2) (2026-03-25)


### Bug Fixes

* improve filter popover scrollbar position ([bf6cad9](https://github.com/jharvey10/gh-notification-manager/commit/bf6cad93f2001c6c168445d02ce5afee0c7dbdf3))

## [1.3.1](https://github.com/jharvey10/gh-notification-manager/compare/v1.3.0...v1.3.1) (2026-03-24)


### Bug Fixes

* batch unsub not marking non-subscribables as done ([008e69f](https://github.com/jharvey10/gh-notification-manager/commit/008e69f42d2832c66079f53b1e92fa44e05653a6))

## [1.3.0](https://github.com/jharvey10/gh-notification-manager/compare/v1.2.1...v1.3.0) (2026-03-21)


### Features

* revamp filtering pipeline and architecture ([06731b7](https://github.com/jharvey10/gh-notification-manager/commit/06731b73b4c405da2c56fdecdfeb1f0d3a0fad4f))


### Bug Fixes

* broken unsub logic ([ee23ae0](https://github.com/jharvey10/gh-notification-manager/commit/ee23ae014367c7a84876e92077ea12649229789e))
* filter out non-unsubbable when doing a bulk action ([5c06300](https://github.com/jharvey10/gh-notification-manager/commit/5c063007407704b8acd5ded8ffacc9eb5340184a))
* improve push notification logic ([a7c6c6d](https://github.com/jharvey10/gh-notification-manager/commit/a7c6c6da7bb540dcb9d51b03c665a8c6164b21ec))

## [1.2.1](https://github.com/jharvey10/gh-notification-manager/compare/v1.2.0...v1.2.1) (2026-03-17)


### Bug Fixes

* re-architect startup and refresh logic ([118705d](https://github.com/jharvey10/gh-notification-manager/commit/118705d946a4177f91b08ac5297540425cb4ac82))

## [1.2.0](https://github.com/jharvey10/gh-notification-manager/compare/v1.1.0...v1.2.0) (2026-03-13)


### Features

* improve subscription awareness logic ([97f6fd7](https://github.com/jharvey10/gh-notification-manager/commit/97f6fd77e2554eda377cf8768651635a3a79e51c))


### Bug Fixes

* add app version to settings page ([296413f](https://github.com/jharvey10/gh-notification-manager/commit/296413fa8b0bd2c4450706d4295d58ee198915c4))
* race condition between mutations and polling ([c776756](https://github.com/jharvey10/gh-notification-manager/commit/c776756119c007eb1bb40c5c6fa00c928df8913b))

## [1.1.0](https://github.com/jharvey10/gh-notification-manager/compare/v1.0.0...v1.1.0) (2026-03-12)


### Features

* improved timeline event awareness ([f06f085](https://github.com/jharvey10/gh-notification-manager/commit/f06f0858617542dcd6e58d8bfed091fcc72b7001))

## [1.0.0](https://github.com/jharvey10/gh-notification-manager/compare/gh-notification-manager-v0.1.0...gh-notification-manager-v1.0.0) (2026-03-11)


### ⚠ BREAKING CHANGES

* force version 0.1.0

### Features

* force version 0.1.0 ([3456bbe](https://github.com/jharvey10/gh-notification-manager/commit/3456bbe792f93956930d64a80b6724c9694b1fa6))


### Bug Fixes

* adjust publication workflow ([b1ed2f0](https://github.com/jharvey10/gh-notification-manager/commit/b1ed2f0b5b2c091dba27514f186e0fdc19eb3558))
