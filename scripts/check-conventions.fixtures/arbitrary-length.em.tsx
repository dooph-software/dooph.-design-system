// Fixture: arbitrary px/rem/em/deg in classNames, an em length. One violation:
// underline-offset-[0.2em]. Not reported: a keyword offset (underline-offset-auto).
export function ArbitraryEm() {
  return <a className="underline underline-offset-[0.2em] underline-offset-auto" href="#a" />;
}
