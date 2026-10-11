// Fixture: size keys named default or small. One violation: the `default` key in FixtureSize.
// Not reported: a `default` VARIANT key (as in HotkeyIndicator and Menu constants).
export const FixtureSize = {
  default: "default",
  sm: "sm",
} as const;
export const FixtureVariant = {
  default: "default",
  menu: "menu",
} as const;
