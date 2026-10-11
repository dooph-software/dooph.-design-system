// Fixture: arbitrary px/rem/em/deg in classNames, an angle. One violation:
// -rotate-[8deg]. Not reported: a theme rotation step (rotate-45).
export function ArbitraryAngle() {
  return <div className="-rotate-[8deg] rotate-45" />;
}
