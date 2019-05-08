# Changelog

## [Unreleased][]

-   Add support for managing side effects
-   Make subviews, delegated events and side effects storage "private"
    properties
-   Add support for delegated `focus` and `blur` events
-   Document parent/child communication

## [6.0.1][] - 2019-04-04

### Fixed

-   Caching non-existent elements should return `null` to align with
    [`Document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector#Return_value)
    specification.

## [6.0.0][] - 2019-04-04

### Breaking

-   `state` and `props` arguments in `render` method have been removed in favor
    of using `this.state` and `this.props` directly
-   Current state key value is now second argument in `render` method, this
    caters to most common use case of using `render` method

## [5.2.0][] - 2019-04-03

### Changed

-   Rename references of `View` to `Figura`

## [5.1.0][] - 2019-04-03

### Added

-   Tests for `defaultProps`
-   Documentation improvements

## [5.0.0][] - 2019-03-27

### Added

-   Add `removeElement` method

### Changed

-   Use static class properties instead of methods
-   Calling `remove` method doesn’t implicitly remove DOM node

### Removed

-   Remove `stateValueModifier` and `propValueModifier` methods

## [4.0.0][] - 2019-02-19

### Added

-   `valueModifier` is split into state and prop value modifier

### Changed

-   `el`, `childrenEl` and `events` should be functions returing values when
    extending component
-   When removing component all child references are also removed

### Fixed

-   `assignSubview` not getting proper node reference

## [3.0.0][] - 2019-02-18

### Added

-   Initial implementation

[unreleased]: https://github.com/niksy/figura/compare/v6.0.1...HEAD
[6.0.1]: https://github.com/niksy/figura/compare/v6.0.0...v6.0.1
[6.0.0]: https://github.com/niksy/figura/compare/v5.2.0...v6.0.0
[5.2.0]: https://github.com/niksy/figura/compare/v5.1.0...v5.2.0
[5.1.0]: https://github.com/niksy/figura/compare/v5.0.0...v5.1.0
[5.0.0]: https://github.com/niksy/figura/compare/v4.0.0...v5.0.0
[4.0.0]: https://github.com/niksy/figura/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/niksy/figura/tree/v3.0.0
