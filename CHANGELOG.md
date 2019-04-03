# Changelog

## [Unreleased][]

### Changed

- Rename references of `View` to `Figura`

## [5.1.0][] - 2019-04-03

### Added

- Tests for `defaultProps`
- Documentation improvements

## [5.0.0][] - 2019-03-27

### Added

- Add `removeElement` method

### Changed

- Use static class properties instead of methods
- Calling `remove` method doesn’t implicitly remove DOM node

### Removed

- Remove `stateValueModifier` and `propValueModifier` methods

## [4.0.0][] - 2019-02-19

### Added

- `valueModifier` is split into state and prop value modifier

### Changed

- `el`, `childrenEl` and `events` should be functions returing values when extending component
- When removing component all child references are also removed

### Fixed

- `assignSubview` not getting proper node reference

## [3.0.0][] - 2019-02-18

### Added

- Initial implementation


[Unreleased]: https://github.com/niksy/figura/compare/v5.1.0...HEAD
[5.1.0]: https://github.com/niksy/figura/compare/v5.0.0...v5.1.0
[5.0.0]: https://github.com/niksy/figura/compare/v4.0.0...v5.0.0
[4.0.0]: https://github.com/niksy/figura/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/niksy/figura/tree/v3.0.0
