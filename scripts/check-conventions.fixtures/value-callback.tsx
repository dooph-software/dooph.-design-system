// Fixture: value callbacks not named onValueChange. One violation: onChange(value).
// Not reported: onValueChange, and a DOM-event handler.
export interface ValueCallbackProps {
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  onInput?: (event: Event) => void;
}
