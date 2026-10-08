// WI-C7-05/-06/-07 element-access probe (F-039). One case per line; tsc errors map to cases by line number.
import { useRef } from "react";
import { Calendar, CheckIcon, CloverShape, DatePicker, DatePickerMode, HotkeyIndicator, MorphRotationShape, MorphRotationShapeMode, PuffShape, ShapeMorphSpinner, SidebarWithHoverIcon, SplitButton } from "@dooph-software/design-system";

export function Probe() {
  const span = useRef<HTMLSpanElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const div = useRef<HTMLDivElement>(null);
  const d = new Date(2026, 8, 15);
  const f = () => {};
  return (
    <>
      <HotkeyIndicator keys={["K"]} ref={span} />
      <SplitButton ref={div} data-x="1" aria-label="Save options">Save</SplitButton>
      <MorphRotationShape ref={span} mode={MorphRotationShapeMode.autoplay} shapes={[CloverShape, PuffShape]} />
      <ShapeMorphSpinner ref={span} />
      <CheckIcon aria-label="Done" role="img" onClick={f} ref={svg} style={{ opacity: 0.5 }} />
      <SidebarWithHoverIcon ref={svg} onClick={f} />
      <CloverShape size={24} className="text-primary" ref={svg} />
      <Calendar mode={DatePickerMode.singleDay} selected={d} onSelect={f} id="c" aria-label="Pick a day" ref={div} />
      <DatePicker mode={DatePickerMode.singleDay} value={d} onChange={f} triggerProps={{ id: "dp", "aria-describedby": "hint" }} contentProps={{ align: "end" }} />
    </>
  );
}
