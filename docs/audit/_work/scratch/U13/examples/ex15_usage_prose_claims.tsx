// Probes of API claims made in usage/SKILL.md PROSE (not fenced examples).
// Each line cites the claim. `@ts-expect-error` lines assert the skill's
// "compile error" claims; tsc reports TS2578 if the error does NOT occur.
import {
  BodyText, HeroText, FontAxes, Tracking, BaseText, TextVariant,
  Sticker, StickerVariant, StickerSize,
  SliderContinuous, SliderStepped, SliderLabeled, SliderVariant,
  RollingDigitsText, LabelText,
  SidebarWithHoverIcon, SidebarIconSide,
  DropdownMenu, DropdownMenuSelectType, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuSection, DropdownMenuMultiSelectItem, DropdownMenuPlainItem,
  DropdownMenuRadioGroup, DropdownMenuRadioSelectItem, DropdownMenuSegment,
  MorphRotationShape, MorphRotationShapeMode, DropdownCaret, DropdownCaretVariant,
  ShapeMorphSpinner, CopyButton, CopyButtonVariant, OutlineButton, TextLink,
  TypeableDropdownTrigger, Tooltip, TooltipContent, LinearProgressIndicator,
  VerificationCodeInput, CodeDigitInput, RollChangeText, FadeChangeText, RevealChangeText,
  ShapeButton, ShapeButtons, ShapeButtonVariant, CTAButton, CTAButtonVariant, CTAButtonSize,
  ToggleSwitch, ToggleSwitchItem, SegmentedTabSelect, SegmentedTabItem,
  ModalContent, SheetContent, SheetSide, Modal, Sheet,
  DatePicker, DatePickerMode, CalendarPresets, DEFAULT_CALENDAR_PRESETS, DEFAULT_SPLIT_TRIGGER_PRESETS,
  Table, TableSortDirection, HotkeyIndicator, cn,
} from "@dooph-software/design-system";

export const Probes = () => (
  <>
    {/* L262-273 Text prop table */}
    <BodyText axes={{ [FontAxes.grade]: 40 }} letterSpacing={Tracking.body} unstyled tabular={false} />
    <HeroText as="h1">x</HeroText>
    <BaseText variant={TextVariant.body}>x</BaseText>

    {/* L154-160 Sticker; custom REQUIRES color → compile error */}
    <Sticker variant={StickerVariant.prominent} size={StickerSize.micro}>x</Sticker>
    <Sticker variant={StickerVariant.custom} color="text">x</Sticker>
    {/* @ts-expect-error — usage L159-160: omitting color on custom is a compile error */}
    <Sticker variant={StickerVariant.custom}>x</Sticker>

    {/* L121-127 Slider; custom REQUIRES color; stepColor; SliderLabeled labels */}
    <SliderContinuous variant={SliderVariant.prominent} color="text" />
    <SliderStepped variant={SliderVariant.primary} stepColor="text" />
    {/* @ts-expect-error — usage L125-126: omitting color on custom is a compile error */}
    <SliderContinuous variant={SliderVariant.custom} />
    <SliderLabeled labels={{ start: "a", end: "b" }} />

    {/* L193-200 RollingDigitsText smallDecimals requires smallDecimalsComponent */}
    <RollingDigitsText>{"$1,234.56"}</RollingDigitsText>
    <RollingDigitsText smallDecimals smallDecimalsComponent={LabelText}>{"$1.00"}</RollingDigitsText>
    {/* @ts-expect-error — usage L198-199: "which the types enforce" */}
    <RollingDigitsText smallDecimals>{"$1.00"}</RollingDigitsText>

    {/* L202-206 SidebarWithHoverIcon side + controlled hovered */}
    <SidebarWithHoverIcon side={SidebarIconSide.left} hovered={false} />

    {/* L130-140 menus */}
    <DropdownMenu selectType={DropdownMenuSelectType.multi}>
      <DropdownMenuTrigger />
      <DropdownMenuContent focusOnOpen={false}>
        <DropdownMenuSection width="complex">
          <DropdownMenuMultiSelectItem checked>x</DropdownMenuMultiSelectItem>
          <DropdownMenuPlainItem>x</DropdownMenuPlainItem>
        </DropdownMenuSection>
        <DropdownMenuRadioGroup value="a"><DropdownMenuRadioSelectItem value="a">a</DropdownMenuRadioSelectItem></DropdownMenuRadioGroup>
        <DropdownMenuSegment />
      </DropdownMenuContent>
    </DropdownMenu>

    {/* L210-211 MorphRotationShape required mode; DropdownCaret variant */}
    <MorphRotationShape mode={MorphRotationShapeMode.autoplay} />
    {/* @ts-expect-error — usage L210: "required `mode`" */}
    <MorphRotationShape />
    <DropdownCaret variant={DropdownCaretVariant.typeable} />
    <ShapeMorphSpinner size={32} color="text" />

    {/* L113-119 actions */}
    <CopyButton value="x" variant={CopyButtonVariant.ghost} />
    <OutlineButton inverseTheme glowing glowColor1="red" glowColor2="blue">x</OutlineButton>
    <ShapeButton shape={ShapeButtons.squircle} variant={ShapeButtonVariant.primary} />
    <CTAButton variant={CTAButtonVariant.primary} size={CTAButtonSize.big}>x</CTAButton>
    <TextLink asChild><a href="/">x</a></TextLink>
    <LinearProgressIndicator color="text" />
    <VerificationCodeInput length={6} />

    {/* L179-190 animated text */}
    <RollChangeText changeKey="a">x</RollChangeText>
    <FadeChangeText changeKey="a">x</FadeChangeText>
    <RevealChangeText changeKey={null} onSettled={() => {}}>x</RevealChangeText>

    {/* responsive-sheet-modal.md:14-16 — both roots take `modal`; both contents have `withOverlay` */}
    <Modal modal><ModalContent withOverlay={false} /></Modal>
    <Sheet modal><SheetContent side={SheetSide.left} withOverlay={false} /></Sheet>

    <ToggleSwitch><ToggleSwitchItem value="a">a</ToggleSwitchItem></ToggleSwitch>
    <DatePicker mode={DatePickerMode.dateRange} />
  </>
);

// L167-171 CalendarPresets shape
export const presets = [CalendarPresets.today, CalendarPresets.days.three, CalendarPresets.days.thirty,
  CalendarPresets.months.six, CalendarPresets.custom({ id: "x", label: "X", days: 5 }),
  ...DEFAULT_CALENDAR_PRESETS, ...DEFAULT_SPLIT_TRIGGER_PRESETS];
// L171 DateRange is structural { from: Date; to: Date }
