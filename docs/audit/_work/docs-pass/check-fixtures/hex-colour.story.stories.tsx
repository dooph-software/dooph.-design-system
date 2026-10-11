// Fixture: hex colour literals in components and stories, in a story. One
// violation: #7c5cff. Not reported: a token passed as the colour.
export const Story = {
  render: () => (
    <div>
      <span style={{ color: "#7c5cff" }} />
      <span style={{ color: "var(--ui-color-ai-gemini)" }} />
    </div>
  ),
};
