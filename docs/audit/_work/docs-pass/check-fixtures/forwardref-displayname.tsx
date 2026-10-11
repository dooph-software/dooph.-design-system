// Fixture: forwardRef without displayName. One violation: Anonymous.
// Not reported: a named function (with and without generics) or a displayName.
import { forwardRef } from "react";

const Anonymous = forwardRef<HTMLDivElement, { a?: string }>((props, ref) => (
  <div ref={ref} {...props} />
));

const NamedFn = forwardRef<HTMLDivElement, { a?: string }>(function NamedFn(props, ref) {
  return <div ref={ref} {...props} />;
});

const NamedPlain = forwardRef(function NamedPlain(props: { a?: string }, ref: React.Ref<HTMLDivElement>) {
  return <div ref={ref} {...props} />;
});

const WithDisplayName = forwardRef<HTMLDivElement, { a?: string }>((props, ref) => (
  <div ref={ref} {...props} />
));
WithDisplayName.displayName = "WithDisplayName";

export { Anonymous, NamedFn, NamedPlain, WithDisplayName };
