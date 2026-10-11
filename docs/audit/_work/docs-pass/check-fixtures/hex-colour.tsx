// Fixture: hex colour literals in components and stories. One violation: #1a2b3c.
// Not reported: an HTML character reference (&#8212;), and #fff in a comment.
export function HexColour() {
  return <span style={{ color: "#1a2b3c" }}>a &#8212; b</span>;
}
