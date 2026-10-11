// Fixture: arbitrary px/rem/em/deg in classNames. One violation: w-[13px].
// Not reported: a percentage or a token-named size.
export function ArbitraryLength() {
  return <div className="w-[13px] h-[50%] size-button" />;
}
