# Changelog

## [Unreleased][]

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


[Unreleased]: https://github.com/niksy/figura/compare/v4.0.0...HEAD
[4.0.0]: https://github.com/niksy/figura/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/niksy/figura/tree/v3.0.0
