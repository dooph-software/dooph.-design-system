// Fixture: arbitrary px/rem/em/deg in classNames, in a story (stories are
// checked). One violation: w-[320px]. Not reported: a fixed demo width set in
// style, which is how a story sizes a frame no token describes.
export const Story = {
  render: () => (
    <div>
      <div className="w-[320px]" />
      <div style={{ width: 320 }} />
    </div>
  ),
};
