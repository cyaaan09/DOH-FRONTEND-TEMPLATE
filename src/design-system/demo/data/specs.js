// GENERATED from spec Appendix C — do not hand-edit.
// Regenerate with `node scripts/build-spec-data.mjs`.
export const SPEC_GROUPS = [
  {
    "name": "Containers & surfaces",
    "summary": "canvas #EEF1F6 · card #FFF radius 14 · sunken #FAFBFD",
    "rows": [
      {
        "k": "Canvas",
        "v": "#EEF1F6 — page background; text on it uses #5A6577"
      },
      {
        "k": "Card",
        "v": "#FFF · radius 14px · 1px #E4E8EF · shadow 0 1px 2px rgba(16,24,40,.04)"
      },
      {
        "k": "Card gutter",
        "v": "24px x · 20px on cards under ~360px"
      },
      {
        "k": "Card header",
        "v": "pad 20px 24px 4px · title 17px / 700 · sub 13.5px / 400 #667085"
      },
      {
        "k": "Card footer",
        "v": "#FAFBFD · 1px top #EEF1F6 · pad 13–16px 20–24px"
      },
      {
        "k": "Internal rule",
        "v": "1px #EEF1F6 (rows use #F5F7FA)"
      },
      {
        "k": "Sunken strip",
        "v": "#FAFBFD — expanded rows, headers, footers"
      },
      {
        "k": "Input well",
        "v": "#F7F9FC — read-only fields, in-panel search"
      },
      {
        "k": "Control shell",
        "v": "#F4F6FA — segmented tabs, row hover in nav"
      },
      {
        "k": "Muted card",
        "v": "#FBFCFE — closed / archived stat cards"
      },
      {
        "k": "Dashed panel",
        "v": "1.6px dashed #CDD5E2 · radius 10–12px — dropzones, empty states only"
      },
      {
        "k": "Selected surface",
        "v": "#F7FCF9 + 1px #25A94E + ring 0 0 0 3px rgba(37,169,78,.10–.12)"
      },
      {
        "k": "Popover panel",
        "v": "#FFF · radius 12px · pad 6px · shadow 0 12px 28px rgba(16,24,40,.14)"
      },
      {
        "k": "Dialog surface",
        "v": "#FFF · radius 14px · max-w 428px · shadow 0 24px 60px rgba(16,24,40,.28)"
      },
      {
        "k": "Section gap",
        "v": "22px between cards · 12px in stat grids · 20px between sub-blocks"
      },
      {
        "k": "Content width",
        "v": "detail pages max-w 1320px · table pages 1560px · page pad 26px 32px, both"
      },
      {
        "k": "Nesting",
        "v": "cards never nest — divide or sink instead"
      },
      {
        "k": "Overflow",
        "v": "cards clip with overflow:hidden; popover parents need overflow:visible"
      }
    ]
  },
  {
    "name": "Chips",
    "summary": "auto height (20px) · radius 999 · 11px/700 · tint + matching text",
    "rows": [
      {
        "k": "Height",
        "v": "auto — padding 3px 9px renders 20px at 11px type"
      },
      {
        "k": "Radius",
        "v": "999px"
      },
      {
        "k": "Type",
        "v": "11px / 700 / nowrap"
      },
      {
        "k": "Dot",
        "v": "6px circle, gap 6px, left pad 7px"
      },
      {
        "k": "Gap in row",
        "v": "7px"
      },
      {
        "k": "Approved",
        "v": "#E8F6EC bg · #15803D text"
      },
      {
        "k": "Active (filled)",
        "v": "#177236 bg · #FFFFFF text = 6.01:1 (never #17A34A — 3.29:1)"
      },
      {
        "k": "Pending",
        "v": "#FEF2E0 bg · #8A5206 text = 5.77:1 (#A16207 is 4.45:1 — fails)"
      },
      {
        "k": "Returned",
        "v": "#FEE2E2 bg · #B42318 text = 5.38:1"
      },
      {
        "k": "Closed",
        "v": "#EEF1F6 bg · #5A6577 text = 5.21:1 (#667085 is 4.39:1 — fails)"
      },
      {
        "k": "Online",
        "v": "#EAF2FE bg · #175CD3 text"
      },
      {
        "k": "Add / Modify",
        "v": "#F0ECFE bg · #6941C6 text"
      },
      {
        "k": "Service chip",
        "v": "12px/400 · 5px 12px · #FFF bg · 1px #DDE2EA · #475467"
      },
      {
        "k": "Filter chip on",
        "v": "#177236 bg · #FFF text = 6.01:1 · 7px 13px · shadow 0 1px 2px rgba(20,80,40,.24)"
      },
      {
        "k": "Filter chip off",
        "v": "#FFF bg · 1px #D5DBE6 · #475467 / 500"
      },
      {
        "k": "Dismiss ×",
        "v": "17px circle · #E4E8EF bg → #D5DBE6 hover · glyph #475467 (4.05:1 at #667085 fails)"
      }
    ]
  },
  {
    "name": "Tabs",
    "summary": "underline 2.5px · segmented 3px inset · stage cards 12px radius",
    "rows": [
      {
        "k": "Underline pad",
        "v": "14px 2px · row gap 22px"
      },
      {
        "k": "Underline type",
        "v": "13.5px / 700"
      },
      {
        "k": "Marker",
        "v": "2.5px solid #177236"
      },
      {
        "k": "Active text",
        "v": "#15803D",
        "c": "#15803D"
      },
      {
        "k": "Idle tab text",
        "v": "#5A6577 (5.89:1)"
      },
      {
        "k": "Tab count",
        "v": "mono 11.5px/500 · pad 2px 7px · radius 9px"
      },
      {
        "k": "Count active",
        "v": "#E8F6EC bg · #15803D"
      },
      {
        "k": "Count idle",
        "v": "#F4F6FA bg · #5A6577"
      },
      {
        "k": "Segmented shell",
        "v": "#F4F6FA · radius 9px · pad 3px · gap 6px"
      },
      {
        "k": "Segment on",
        "v": "#FFF · radius 7px · 12.5px/700 · shadow 0 1px 2px rgba(16,24,40,.08)"
      },
      {
        "k": "Segment off",
        "v": "transparent · #667085 / 500"
      },
      {
        "k": "Stage card",
        "v": "radius 12px · pad 13px 15px 14px · 1px #E4E8EF"
      },
      {
        "k": "Stage active",
        "v": "1px #25A94E + ring 0 0 0 3px rgba(37,169,78,.12)"
      },
      {
        "k": "Stage figure",
        "v": "25px / 700 / -0.02em"
      },
      {
        "k": "Stage urgent",
        "v": "11.5px / 700 · #B42318"
      }
    ]
  },
  {
    "name": "Text fields",
    "summary": "38px · radius 9 · 1px #D5DBE6 · green focus ring",
    "rows": [
      {
        "k": "Height",
        "v": "38px · pad 0 12px"
      },
      {
        "k": "Radius",
        "v": "9px"
      },
      {
        "k": "Border",
        "v": "1px solid #D5DBE6"
      },
      {
        "k": "Value type",
        "v": "13.5px / 400 · #1E2532"
      },
      {
        "k": "Placeholder",
        "v": "#667085",
        "c": "#667085"
      },
      {
        "k": "Label",
        "v": "12.5px / 500 · #344054 · 6px below"
      },
      {
        "k": "Hint",
        "v": "12px / 400 · #667085 · 5px above"
      },
      {
        "k": "Focus",
        "v": "border #25A94E + 0 0 0 3px rgba(37,169,78,.15)"
      },
      {
        "k": "Error",
        "v": "border #B42318 · hint #B42318"
      },
      {
        "k": "Read only",
        "v": "bg #F7F9FC · border #E4E8EF · text #8A94A6"
      },
      {
        "k": "Leading icon",
        "v": "12px ring · gap 8px"
      },
      {
        "k": "Trailing action",
        "v": "11.5px / 700 · #667085 · pad 6px"
      },
      {
        "k": "Textarea",
        "v": "pad 11px 12px · line-height 1.55 · resize vertical"
      },
      {
        "k": "Mono values",
        "v": "JetBrains Mono 13.5px / 400"
      }
    ]
  },
  {
    "name": "Dropdowns",
    "summary": "38px trigger · panel radius 12 · option 9px 10px",
    "rows": [
      {
        "k": "Trigger",
        "v": "38px · radius 9px · 1px #D5DBE6 · gap 8px"
      },
      {
        "k": "Open trigger",
        "v": "1px #25A94E + ring rgba(37,169,78,.15)"
      },
      {
        "k": "Value",
        "v": "13.5px / 500 · #1E2532 · ellipsis"
      },
      {
        "k": "Placeholder",
        "v": "13.5px / 400 · #667085"
      },
      {
        "k": "Caret",
        "v": "9px ▾ · #98A2B3 (decorative)"
      },
      {
        "k": "Panel",
        "v": "top 44px · radius 12px · pad 6px · 1px #E4E8EF"
      },
      {
        "k": "Panel shadow",
        "v": "0 12px 28px rgba(16,24,40,.14)"
      },
      {
        "k": "Panel max-h",
        "v": "246px (214px with filter)"
      },
      {
        "k": "Option",
        "v": "pad 9px 10px · radius 8px · 13.5px / 400"
      },
      {
        "k": "Option selected",
        "v": "#F2FAF4 bg · #15803D / 700 · ✓ 12px"
      },
      {
        "k": "Checkbox in list",
        "v": "15px · radius 4px · #177236 when on (white ✓)"
      },
      {
        "k": "Panel filter",
        "v": "32px field · #F7F9FC · radius 8px"
      },
      {
        "k": "Panel footer",
        "v": "#FAFBFD · 1px top #EEF1F6 · pad 9px 12px"
      },
      {
        "k": "Inline variant",
        "v": "34px · radius 8px · 1px #DDE2EA · 12.5px / 700"
      },
      {
        "k": "Menu item",
        "v": "13.5px / 400 · destructive #B42318 / 700 last"
      }
    ]
  },
  {
    "name": "Buttons",
    "summary": "38 / 34 / 44px · radius 9 (8 compact) · one filled green per region",
    "rows": [
      {
        "k": "Default",
        "v": "38px · pad 0 16px · radius 9px · 13.5px / 700"
      },
      {
        "k": "Compact",
        "v": "34px · pad 0 14px · radius 8px · 12.5px"
      },
      {
        "k": "Icon only",
        "v": "34×34px · radius 8px"
      },
      {
        "k": "Primary",
        "v": "#177236 bg · #FFF text = 6.01:1 · shadow 0 1px 2px rgba(20,80,40,.25)"
      },
      {
        "k": "Primary hover",
        "v": "#125A2B (8.35:1)"
      },
      {
        "k": "Secondary",
        "v": "#FFF bg · 1px #D5DBE6 · #344054 / 500"
      },
      {
        "k": "Secondary hover",
        "v": "#F4F6FA",
        "c": "#F4F6FA"
      },
      {
        "k": "Destructive",
        "v": "#FFF bg · 1px #E4A49C · #B42318 · hover #FEF3F2"
      },
      {
        "k": "Ghost",
        "v": "transparent · #15803D / 700 · hover #F2FAF4"
      },
      {
        "k": "Disabled",
        "v": "#F7F9FC bg · 1px #E4E8EF · #B9C1D1"
      },
      {
        "k": "Pending",
        "v": "#125A2B + 12px spinner, 2px track rgba(255,255,255,.4)"
      },
      {
        "k": "Row gap",
        "v": "10px (8px in dialogs and cards)"
      }
    ]
  },
  {
    "name": "File inputs",
    "summary": "dashed 1.6px dropzone · file row 10px radius",
    "rows": [
      {
        "k": "Dropzone",
        "v": "pad 16px · radius 10px · 1.6px dashed #CDD5E2"
      },
      {
        "k": "Dropzone hover",
        "v": "border #25A94E · bg #F7FCF8"
      },
      {
        "k": "Icon tile",
        "v": "36×36px · radius 8px · #EEF1F6 · #667085"
      },
      {
        "k": "Primary line",
        "v": "13.5px / 700"
      },
      {
        "k": "Constraint line",
        "v": "12px / 400 · #667085"
      },
      {
        "k": "Compact variant",
        "v": "38px shell · Browse 28px · radius 7px"
      },
      {
        "k": "File row",
        "v": "pad 12px 14px · radius 10px · 1px #E4E8EF · gap 12px"
      },
      {
        "k": "Type mark",
        "v": "34×34px · radius 8px · #EEF1F6 · #5A6577 10px / 700"
      },
      {
        "k": "Progress track",
        "v": "5px · radius 999px · #EEF1F6"
      },
      {
        "k": "Progress fill",
        "v": "linear-gradient(90deg,#25A94E,#7BC96F)"
      },
      {
        "k": "Done note",
        "v": "12px / 400 · #15803D"
      },
      {
        "k": "Failed row",
        "v": "#FEF3F2 bg · 1px #F5CDC7 · mark #FEE2E2/#B42318"
      },
      {
        "k": "Remove",
        "v": "26px · radius 7px · #667085 → #B42318 hover"
      }
    ]
  },
  {
    "name": "Toasts & notices",
    "summary": "toast 12px radius, 5s timer · notice 32px pill",
    "rows": [
      {
        "k": "Toast width",
        "v": "372px · stack gap 10px · bottom-right 16px"
      },
      {
        "k": "Toast shell",
        "v": "radius 12px · pad 13px 12px 15px 13px · #FFF"
      },
      {
        "k": "Toast shadow",
        "v": "0 8px 24px rgba(16,24,40,.12)"
      },
      {
        "k": "Icon tile",
        "v": "26×26px · radius 8px · #FFF glyph on the tone TEXT colour (#15803D / #B42318 / #8A5206 / #175CD3) — the lighter dot tones fail with white"
      },
      {
        "k": "Title / body",
        "v": "13.5px / 700 · 12.5px / 400 #667085"
      },
      {
        "k": "Timer bar",
        "v": "3px · scaleX 1→0 over 5s · tone fill"
      },
      {
        "k": "Success tone",
        "v": "dot #17A34A · border #CDEAD6 · text/icon #15803D"
      },
      {
        "k": "Error tone",
        "v": "dot #E5484D · border #F5CDC7 · text/icon #B42318"
      },
      {
        "k": "Warning tone",
        "v": "dot #D9A13B · border #F2E0BD · text/icon #8A5206"
      },
      {
        "k": "Info tone",
        "v": "dot #175CD3 · border #D5E4FA · text/icon #175CD3"
      },
      {
        "k": "Max stack",
        "v": "3 toasts, newest first"
      },
      {
        "k": "Notice shell",
        "v": "min-h 32px · radius 16px · pad 4px 10px 4px 4px · gap 12px"
      },
      {
        "k": "Notice label",
        "v": "24px · radius 16px · pad 0 12px · 12.5px / 400 · 1px tone/200"
      },
      {
        "k": "Notice text",
        "v": "13px / 400 in tone colour on tone/50 — all four ≥ 4.5:1"
      },
      {
        "k": "Notice fills",
        "v": "#ECFDF3 · #EFF8FF · #FFFAEB · #FEF3F2"
      }
    ]
  },
  {
    "name": "Selection controls",
    "summary": "17px targets · gap 10px · cards radius 11",
    "rows": [
      {
        "k": "Checkbox",
        "v": "17×17px · radius 5px · 1.8px border"
      },
      {
        "k": "Checkbox on",
        "v": "#177236 fill + border · ✓ 10px / 700 #FFF (6.01:1)"
      },
      {
        "k": "Checkbox off",
        "v": "#FFF fill · 1.8px #C3CAD6"
      },
      {
        "k": "Indeterminate",
        "v": "same fill, glyph – (dash)"
      },
      {
        "k": "Disabled",
        "v": "#E9EDF3 fill · 1.8px #DDE2EA · glyph #B9C1D1"
      },
      {
        "k": "Radio",
        "v": "17×17px circle · 1.8px · inner dot 8px #177236"
      },
      {
        "k": "Label",
        "v": "13.5px / 400 · #344054 · gap 10px"
      },
      {
        "k": "Row gap",
        "v": "11px (14px for switches)"
      },
      {
        "k": "Card",
        "v": "pad 13px 14px · radius 11px · 1px #E4E8EF · gap 11px"
      },
      {
        "k": "Card selected",
        "v": "1px #25A94E · bg #F7FCF9 · ring rgba(37,169,78,.10)"
      },
      {
        "k": "Switch track",
        "v": "38×22px · radius 999px · pad 2px"
      },
      {
        "k": "Track on / off",
        "v": "#177236 / #D5DBE6 · disabled #C3CAD6"
      },
      {
        "k": "Knob",
        "v": "18px circle #FFF · shadow 0 1px 2px rgba(16,24,40,.2)"
      },
      {
        "k": "Bulk bar",
        "v": "pad 11px 16px · #FAFBFD idle · #F2FAF4 active"
      },
      {
        "k": "Selected row",
        "v": "#F7FCF9 bg · 1px top #F5F7FA"
      }
    ]
  },
  {
    "name": "Dialog, empty & loading",
    "summary": "dialog 428px · scrim 42% ink · skeleton 11px bars",
    "rows": [
      {
        "k": "Scrim",
        "v": "rgba(23,30,44,.42) · pad 24px"
      },
      {
        "k": "Dialog",
        "v": "max-w 428px · radius 14px · #FFF"
      },
      {
        "k": "Dialog shadow",
        "v": "0 24px 60px rgba(16,24,40,.28)"
      },
      {
        "k": "Body pad",
        "v": "22px 24px 18px"
      },
      {
        "k": "Icon tile",
        "v": "30×30px · radius 9px · #FEF3F2 · 1px #F5CDC7 · #B42318"
      },
      {
        "k": "Title / body",
        "v": "16.5px / 700 · 13.5px / 400 line-height 1.55"
      },
      {
        "k": "Footer",
        "v": "#FAFBFD · 1px top #EEF1F6 · pad 14px 24px · gap 8px"
      },
      {
        "k": "Confirm button",
        "v": "#B42318 → hover #96190F"
      },
      {
        "k": "Empty state",
        "v": "pad 30px 20px · 1px dashed #DDE2EA · radius 12px"
      },
      {
        "k": "Empty title",
        "v": "14.5px / 700 · sub 13px #667085"
      },
      {
        "k": "Skeleton bar",
        "v": "11px · radius 6px · #EEF1F6 · 3 rows max"
      }
    ]
  },
  {
    "name": "Layout primitives",
    "summary": "Row · Column · Grid · AutoGrid · Split · Cluster · Sidebar · Page",
    "rows": [
      {
        "k": "Rule",
        "v": "primitives set direction, gap and alignment only — no colour, border, or padding of their own"
      },
      {
        "k": "Gap scale",
        "v": "6 · 8 · 12 · 14 · 16 · 22 · 24 · 32 — no 10, 18, or 20"
      },
      {
        "k": "Row",
        "v": "flex · align center · gap 12 default · wrap off — toolbars, button pairs, label rows"
      },
      {
        "k": "Column",
        "v": "flex column · align stretch · gap 12 default — stacked fields, card bodies"
      },
      {
        "k": "Grid",
        "v": "repeat(12, minmax(0,1fr)) · gap 16 row / 24 col · children span 4 / 6 / 8 / 12, floor 172px"
      },
      {
        "k": "AutoGrid",
        "v": "repeat(auto-fit, minmax(min,1fr)) · gap 12 · min 190px stats, 240–300px panels"
      },
      {
        "k": "Split",
        "v": "Row with a flex:1 spacer — content left, actions right · wraps at 640px"
      },
      {
        "k": "Cluster",
        "v": "Row with wrap on · gap 7–8 — chips, tags, filter pills, service lists"
      },
      {
        "k": "Sidebar",
        "v": "244px rail + flex:1 main · 62px under 1024px · off-canvas under 768px · one per page"
      },
      {
        "k": "Page",
        "v": "max-w 1320px detail / 1560px tables · pad 26px 32px · canvas #EEF1F6"
      },
      {
        "k": "Section",
        "v": "one card + 22px below · cards never nest — divide (1px #EEF1F6) or sink (#FAFBFD) instead"
      },
      {
        "k": "Divider",
        "v": "1px #EEF1F6 between sections · 1px #F5F7FA between rows"
      },
      {
        "k": "Flex children",
        "v": "min-width: 0 on any child whose text must clip, or the ellipsis silently fails"
      },
      {
        "k": "Spacing owner",
        "v": "always the container's gap, never a child's margin"
      }
    ]
  },
  {
    "name": "Stepper",
    "summary": "28px nodes · 2px connector · horizontal ≤4, vertical 5+",
    "rows": [
      {
        "k": "Node",
        "v": "28px circle · 12px / 700 label · connector 2px radius 999px, trailing each node except the last"
      },
      {
        "k": "Connector rule",
        "v": "a step's trailing connector is green only when that step is DONE — the current step's is #EEF1F6, so the fill stops at the node you are on"
      },
      {
        "k": "Done",
        "v": "#177236 fill, 1.8px #177236, ✓ #FFF · connector behind it #177236"
      },
      {
        "k": "Current",
        "v": "--grad-primary fill, #FFF number, 0 0 0 4px rgba(23,114,54,.12) halo"
      },
      {
        "k": "Upcoming",
        "v": "#FFF fill, 1.8px #D5DBE6, #98A2B3 number · connector #EEF1F6"
      },
      {
        "k": "Error",
        "v": "#B42318 fill with #FFF ! · sub-label 11.5px / 500 #B42318 · connector stays unfilled"
      },
      {
        "k": "Step label",
        "v": "13px / 700 · #1E2532 current, #344054 done, #667085 upcoming · clips, never wraps"
      },
      {
        "k": "Sub-label",
        "v": "11.5px · done = date + actor, current = what remains (500 weight #177236), upcoming = requirement"
      },
      {
        "k": "Horizontal",
        "v": "grid repeat(n, minmax(0,1fr)) · gap 12 · node row then labels · 4 steps max"
      },
      {
        "k": "Vertical",
        "v": "grid 28px / 1fr · gap 12 · 2px spine · 18px below each step except the last"
      },
      {
        "k": "Compact",
        "v": "title 13px / 700 + mono % · 5px meter --grad-meter · 4px segments for ≤4 steps"
      },
      {
        "k": "Container",
        "v": "pad 18px 20px · 1px #EEF1F6 · radius 12px · #FBFCFE — a sunken block, not a card"
      },
      {
        "k": "Interaction",
        "v": "done and current are buttons; upcoming is plain text — no forward jumps past validation"
      },
      {
        "k": "ARIA",
        "v": "ol/li with aria-current=step on the current node; state also in the sub-label text, not colour alone"
      }
    ]
  },
  {
    "name": "Date picker",
    "summary": "32px cells · 280px popover · single + two-month range",
    "rows": [
      {
        "k": "Field",
        "v": "38px · mono value · 13px ▦ glyph #667085 right · focus 1px #177236 + 3px ring"
      },
      {
        "k": "Popover",
        "v": "280px · pad 12px · radius 12px · 1px #E4E8EF · shadow 0 12px 28px rgba(16,24,40,.12) · 6px below the field"
      },
      {
        "k": "Month header",
        "v": "13px / 700 #1E2532 centred · 28px ‹ › buttons #667085, hover #F4F6FA"
      },
      {
        "k": "Weekday row",
        "v": "24px · 10.5px / 700 / 0.06em #98A2B3"
      },
      {
        "k": "Day cell",
        "v": "32px · radius 8px · 12.5px · grid 7 cols gap 2px (44px cells on touch)"
      },
      {
        "k": "Day states",
        "v": "default #344054 · other month #C3CAD6 · today inset 0 0 0 1px #A6E7C3 with #177236 700 · selected #177236 / #FFF · unavailable #DDE2EA struck"
      },
      {
        "k": "Range",
        "v": "endpoints #177236 / #FFF · between #E8F6EC / #15803D · two months side by side, gap 16px"
      },
      {
        "k": "Presets",
        "v": "120px column · 12.5px rows radius 8px · active #E8F6EC / #15803D 700 · 1px right #EEF1F6"
      },
      {
        "k": "Range inputs",
        "v": "two 32px mono fields with a #98A2B3 → between them · the focused one takes the green ring"
      },
      {
        "k": "Footer",
        "v": "1px top #EEF1F6 · Today link 12px / 500 #177236 left · constraint note 11.5px #98A2B3 right"
      },
      {
        "k": "Apply button",
        "v": "34px --grad-primary · carries the computed length (Apply · 23 days)"
      },
      {
        "k": "Input parsing",
        "v": "accepts 04/09/2026, 4 Sep 26, 2026-09-04 · normalised on blur · calendar is never the only path"
      },
      {
        "k": "Mobile",
        "v": "popover goes full-width under 420px with 44px cells"
      }
    ]
  },
  {
    "name": "Tooltip & popover",
    "summary": "tooltip #1E2532 label only · popover = content plus actions",
    "rows": [
      {
        "k": "Rule",
        "v": "if it contains a button, it is a popover — a tooltip holds one line of text and nothing else"
      },
      {
        "k": "Tooltip",
        "v": "pad 6px 9px · radius 7px · #1E2532 · 12px / 500 #FFF · 8px rotated arrow · nowrap"
      },
      {
        "k": "Tooltip copy",
        "v": "one line, under 48 characters, sentence case, no full stop"
      },
      {
        "k": "Tooltip timing",
        "v": "120ms delay in, none out · 6px offset from the trigger"
      },
      {
        "k": "Tooltip a11y",
        "v": "aria-describedby · shows on keyboard focus too · becomes a tap-toggle popover on touch · never focusable itself"
      },
      {
        "k": "Hinted trigger",
        "v": "inline text that owns a tooltip takes a 1px dashed underline in its own tone + cursor help"
      },
      {
        "k": "Popover",
        "v": "max-w 300px · pad 14px · radius 12px · #FFF · 1px #E4E8EF · shadow 0 12px 28px rgba(16,24,40,.12)"
      },
      {
        "k": "Popover arrow",
        "v": "10px rotated square, #FFF with the two leading borders — 6px off the trigger"
      },
      {
        "k": "Popover head",
        "v": "13.5px / 700 #1E2532 + × #667085 right · body 12.5px / 1.5 #344054"
      },
      {
        "k": "Popover actions",
        "v": "32px buttons, primary --grad-primary · dismiss reads Got it, not Close"
      },
      {
        "k": "Popover a11y",
        "v": "focus trapped, Esc closes, focus returns to the trigger · it is a dialog without a scrim"
      },
      {
        "k": "Collision",
        "v": "flips side near a viewport edge rather than shifting — the arrow always points at the trigger"
      }
    ]
  },
  {
    "name": "Accordion",
    "summary": "header 14px 18px · body indents to 52px · one open by default",
    "rows": [
      {
        "k": "When",
        "v": "one long record read top to bottom — tabs swap views, accordion reveals sections of the same thing"
      },
      {
        "k": "Container",
        "v": "1px #E4E8EF · radius 12px · #FFF · rows divided by 1px #EEF1F6"
      },
      {
        "k": "Toolbar",
        "v": "12px 18px · #FAFBFD · record title 13px / 700 + Expand all 12px / 500 #177236"
      },
      {
        "k": "Header",
        "v": "pad 14px 18px · gap 12px · the whole row is the button (aria-expanded)"
      },
      {
        "k": "Chevron tile",
        "v": "22px · radius 7px · closed #F4F6FA / #667085 ▸ · open #E8F6EC / #15803D ▾ · decorative"
      },
      {
        "k": "Header text",
        "v": "title 13.5px / 700 #1E2532 · summary 12px #667085 that answers without opening"
      },
      {
        "k": "Header badge",
        "v": "count pill 11px / 700 — #EEF1F6 neutral, #E8F6EC done, #FEE2E2 needs action"
      },
      {
        "k": "Open header",
        "v": "background #FAFBFD · body pad 0 18px 18px 52px, aligned under the title"
      },
      {
        "k": "Body grid",
        "v": "auto-fit minmax(180px,1fr) · gap 14px 22px · labels 10.5px / 700 / 0.08em #5A6577"
      },
      {
        "k": "Default state",
        "v": "first section open, rest collapsed · state persists per record, not per user"
      },
      {
        "k": "Transition",
        "v": "160ms ease on height and background · never animate the text itself"
      }
    ]
  },
  {
    "name": "Search with results",
    "summary": "42px field merging into a grouped panel · keyboard first",
    "rows": [
      {
        "k": "Scope",
        "v": "global find — distinct from the 34px toolbar filter, which narrows the list already shown"
      },
      {
        "k": "Field",
        "v": "42px · pad 0 14px · radius 11px 11px 0 0 when open · 1px #177236 + 3px ring · 14px value"
      },
      {
        "k": "Esc hint",
        "v": "11px mono #667085 in a #F4F6FA pill, 1px #EEF1F6 — inside the field, right"
      },
      {
        "k": "Panel",
        "v": "continues the field: no top border, radius 0 0 11px 11px, shadow 0 12px 28px rgba(16,24,40,.12)"
      },
      {
        "k": "Group header",
        "v": "10.5px / 700 / 0.08em #5A6577 with its count · max 3 groups"
      },
      {
        "k": "Result row",
        "v": "pad 9px 11px · radius 8px · 28px type tile · title 13px / 700 · meta 11.5px mono #667085"
      },
      {
        "k": "Active row",
        "v": "#E8F6EC with a #FFF type tile · preselected but never auto-navigated"
      },
      {
        "k": "Row cap",
        "v": "4 rows per group · everything else behind See all N matches"
      },
      {
        "k": "Missing meta",
        "v": "states the absence in words (no LTO on file) — never an empty second line"
      },
      {
        "k": "Footer",
        "v": "1px top #EEF1F6 · #FAFBFD · keycap hints left, See all 12px / 500 #177236 right"
      },
      {
        "k": "Keys",
        "v": "/ or ⌘K opens · ↑↓ moves · ↵ opens · Esc closes and restores the previous query"
      },
      {
        "k": "ARIA",
        "v": "role=combobox aria-expanded + role=listbox/option · aria-activedescendant follows the arrows"
      }
    ]
  },
  {
    "name": "Notifications & activity",
    "summary": "centre = your unread work · feed = one record's immutable history",
    "rows": [
      {
        "k": "Split",
        "v": "centre is addressed to you and dismissible; the feed is append-only and never marked read"
      },
      {
        "k": "Panel",
        "v": "max-w 380px · radius 12px · 1px #E4E8EF · shadow 0 12px 28px rgba(16,24,40,.12)"
      },
      {
        "k": "Panel head",
        "v": "13px 16px · #FAFBFD · title 13.5px / 700 + #FEE2E2 / #B42318 count · Mark all read 12px / 500 #177236"
      },
      {
        "k": "Item",
        "v": "pad 12px 16px · 1px top #F5F7FA · 28px radius-9 tone tile · body 13px / 1.4 #344054"
      },
      {
        "k": "Unread",
        "v": "#F7FCF9 row + 7px #177236 dot right — never bold text"
      },
      {
        "k": "Item meta",
        "v": "time 11.5px #98A2B3 · inline action 11.5px / 500 #177236, one per item at most"
      },
      {
        "k": "Tone tiles",
        "v": "error #FEE2E2 / #B42318 · portal #EAF2FE / #175CD3 · done #E8F6EC / #15803D · system #F4F6FA / #5A6577"
      },
      {
        "k": "Feed spine",
        "v": "grid 26px / 1fr gap 12px · 26px avatar or tone circle · 2px #EEF1F6 line · 16px below each event"
      },
      {
        "k": "Feed event",
        "v": "body 13px / 1.45 with the actor in 700 #1E2532 · timestamp 11.5px #98A2B3 · newest first"
      },
      {
        "k": "Feed detail",
        "v": "attachments and quoted reasons render inside their own event, #FFF on 1px #EEF1F6, radius 9px"
      },
      {
        "k": "Feed rules",
        "v": "append-only — corrections are new entries, the wrong one stays visible"
      },
      {
        "k": "Live region",
        "v": "arriving notifications announce via aria-live=polite; the panel itself is role=dialog"
      }
    ]
  },
  {
    "name": "Destructive confirmation",
    "summary": "3 levels — undo toast · plain dialog · type to confirm",
    "rows": [
      {
        "k": "Level 1",
        "v": "reversible: no dialog at all — toast with Undo and a 3px meter, 10s window"
      },
      {
        "k": "Level 2",
        "v": "serious but recoverable: plain dialog, destructive OUTLINE button 1px #F9C4BE / #B42318"
      },
      {
        "k": "Level 3",
        "v": "irreversible: type-to-confirm dialog, primary stays disabled until the string matches"
      },
      {
        "k": "Dialog",
        "v": "max-w 428px · radius 14px · #FFF · shadow 0 24px 60px rgba(16,24,40,.28) · scrim rgba(16,24,40,.45)"
      },
      {
        "k": "Header",
        "v": "32px radius-9 #FEE2E2 / #B42318 ! tile + 15.5px / 700 title ending in a question mark"
      },
      {
        "k": "Body",
        "v": "13px / 1.5 #344054 — what happens, to whom, and whether it can be undone. Never Are you sure"
      },
      {
        "k": "Impact strip",
        "v": "#FFF6F5 · 1px #F7D6D1 · radius 10px · 12px #B42318 — the count of affected things"
      },
      {
        "k": "Confirm label",
        "v": "12.5px / 500 with the identifier inline in mono 700 #1E2532 — the LTO number, never the word DELETE"
      },
      {
        "k": "Confirm input",
        "v": "38px mono · error ring while partial · 11.5px / 500 #B42318 reason below (Does not match yet)"
      },
      {
        "k": "Blocked button",
        "v": "1px #F9C4BE on #FFF6F5 with #E9A19B text, cursor not-allowed — visible, not hidden"
      },
      {
        "k": "Matching",
        "v": "trim whitespace, compare case-insensitively · no shake, no toast, no auto-submit"
      },
      {
        "k": "Footer",
        "v": "13px 20px · 1px top #EEF1F6 · #FAFBFD · Cancel then the destructive action, right-aligned"
      },
      {
        "k": "Focus",
        "v": "opens on Cancel (never the destructive button) · Esc cancels · focus returns to the trigger"
      }
    ]
  },
  {
    "name": "Keyboard shortcuts",
    "summary": "? opens the sheet · sequences not chords · suspended in fields",
    "rows": [
      {
        "k": "Contract",
        "v": "listed here means bound everywhere; not listed means not bound"
      },
      {
        "k": "Sheet",
        "v": "max-w 620px · radius 14px · shadow 0 24px 60px rgba(16,24,40,.28) · groups auto-fit minmax(250px,1fr) gap 22px"
      },
      {
        "k": "Keycap",
        "v": "11px mono #344054 · pad 3px 7px · radius 6px · #FFF · 1px #E4E8EF · shadow 0 1px 0 #E4E8EF"
      },
      {
        "k": "Row",
        "v": "label 13px #344054 left, caps right · pad 8px 0 · 1px bottom #F5F7FA"
      },
      {
        "k": "Separator",
        "v": "encodes the relationship: + (10px #98A2B3) for a true chord, italic then for a sequence, italic or for alternates — never one separator for all three"
      },
      {
        "k": "Group label",
        "v": "10.5px / 700 / 0.08em #5A6577 — GLOBAL, NAVIGATE, TABLE, RECORD"
      },
      {
        "k": "Global",
        "v": "/ search · ⌘K palette · ? this sheet · Esc close or cancel"
      },
      {
        "k": "Navigate",
        "v": "g then l issued · g then a applications · g then f facilities · [ toggles the rail"
      },
      {
        "k": "Table",
        "v": "↑↓ rows · ↵ open · space expand · x select · ⌘A select all shown"
      },
      {
        "k": "Record",
        "v": "⌘+↵ save and continue · ⌥+→ / ⌥+← steps · u upload · ⌘+S sign"
      },
      {
        "k": "Sequences",
        "v": "navigation is two keys in sequence, never a chord — chords only for save and select-all"
      },
      {
        "k": "Suspension",
        "v": "single-letter bindings are off while an input, textarea, or contenteditable has focus"
      },
      {
        "k": "Platform",
        "v": "⌘ is Ctrl and ⌥ is Alt on Windows, stated in the footer"
      },
      {
        "k": "Discovery",
        "v": "? opens it and the account menu links it · Print this sheet renders greyscale-safe"
      }
    ]
  },
  {
    "name": "Print & PDF preview",
    "summary": "true-aspect A4 · preview is the print path · invalid output blocked",
    "rows": [
      {
        "k": "Page",
        "v": "A4 portrait at true 210:297 aspect, any scale · 20mm margins shown as a 1px dashed #EEF1F6 guide"
      },
      {
        "k": "Desk",
        "v": "#EEF1F6 around the sheet · sheet #FFF with shadow 0 8px 24px rgba(16,24,40,.16), square corners"
      },
      {
        "k": "Toolbar",
        "v": "10px 14px · #FAFBFD · size select + orientation segmented left · page count and zoom right"
      },
      {
        "k": "Controls",
        "v": "30px selects, 1px #D5DBE6, radius 8px · segmented 3px shell #F4F6FA with a #FFF active tile"
      },
      {
        "k": "Footer",
        "v": "12px 14px · 1px top #EEF1F6 · content toggles left · Download PDF outline + Print --grad-primary right"
      },
      {
        "k": "Certificate",
        "v": "logo tile top-left · LICENSE TO OPERATE 0.1em #177236 centred · mono LTO number · signature block and QR pinned bottom"
      },
      {
        "k": "Unsigned",
        "v": "#FFFCF4 · 1px #F4E4C4 notice · preview watermarked · Print disabled 1px #EEF1F6 / #B9C1D1 · Sign now beside it"
      },
      {
        "k": "Batch",
        "v": "page thumbnails at 210/297 aspect, active 1px #177236 + 2px ring, overflow tile +N dashed #CBD3E0"
      },
      {
        "k": "Batch output",
        "v": "one single-page PDF per licence, named by LTO number, delivered zipped — never one merged file"
      },
      {
        "k": "Fidelity",
        "v": "preview and print share markup and stylesheet with one page box — if they can disagree, the preview is decoration"
      },
      {
        "k": "Blocking",
        "v": "unsigned or expired certificates cannot reach the tray; the fix is one button away in the notice"
      }
    ]
  },
  {
    "name": "Forms & validation",
    "summary": "12-col grid · 16px/24px gutter · error replaces help text in place",
    "rows": [
      {
        "k": "Shell",
        "v": "one card per form · 1px #E4E8EF · radius 14px · header/footer rules #EEF1F6"
      },
      {
        "k": "Header",
        "v": "pad 18px 24px 14px · title 16px/700 · sub 12.5px #667085 · progress 5px #EEF1F6 fill --grad-meter"
      },
      {
        "k": "Body",
        "v": "pad 20px 24px · grid repeat(12, minmax(0,1fr)) · gap 16px row / 24px col · fields span 4 / 8 / 12 · a span-4 cell floors at 172px (one line of 13.5px text) and drops to span 6 below that"
      },
      {
        "k": "Fieldset label",
        "v": "10.5px / 700 / 0.08em #5A6577 + 1px #EEF1F6 rule · 24px above, 14px below"
      },
      {
        "k": "Field label",
        "v": "12.5px / 500 #344054 · 6px above the control · 38px shells clip with ellipsis, never wrap"
      },
      {
        "k": "Required mark",
        "v": "* #B42318 (dark #FF9B95) · 4px gap — used on required fields only"
      },
      {
        "k": "Optional mark",
        "v": "11.5px #98A2B3 lowercase \\\\"
      },
      {
        "k": "Help/error slot",
        "v": "one shared slot per field: 5px below the control, min-height 32px, line-height 1.35 — reserved for two lines so validating never reflows the row"
      },
      {
        "k": "Error text",
        "v": "11.5px / 500 #B42318 + 13px round ! badge, align-items flex-start · REPLACES help text in the shared slot"
      },
      {
        "k": "Error field",
        "v": "1px #E5484D + 0 0 0 3px rgba(229,72,77,.14) · dark #FF9B95 / .18"
      },
      {
        "k": "Read-only",
        "v": "background #F4F6FA · 1px #EEF1F6 · text #98A2B3 · never a disabled input"
      },
      {
        "k": "Textarea",
        "v": "min-height 76px · pad 10px 12px · line-height 1.5 · counter 11.5px mono right"
      },
      {
        "k": "Token field",
        "v": "min-height 38px · pad 5px 8px · chips 26px --green-100 / --green-text with × at .75 opacity"
      },
      {
        "k": "Consent row",
        "v": "#FBFCFE · 1px #EEF1F6 · radius 10px · pad 12px 14px · 17px checkbox + 13px copy"
      },
      {
        "k": "Footer",
        "v": "pad 14px 24px · 1px top #EEF1F6 · #FAFBFD · autosave note left, actions right"
      },
      {
        "k": "Actions",
        "v": "38px · primary --grad-primary / #FFF 700 · secondary 1px #D5DBE6 on #FFF · order Back then Continue"
      },
      {
        "k": "Autosave note",
        "v": "12px #667085 + 6px #D9A13B dot"
      },
      {
        "k": "Validation timing",
        "v": "on blur, then on every change once errored · never on first keystroke"
      },
      {
        "k": "Submit failure",
        "v": "focus the first errored field, scroll it under the sticky header, announce the count via aria-live"
      },
      {
        "k": "Mobile",
        "v": "grid collapses to 1 col · gutter 20px · footer becomes sticky, buttons full-width stacked"
      }
    ]
  },
  {
    "name": "App shell — sidebar & header",
    "summary": "rail 244px · item 9px radius · header 12px 32px sticky",
    "rows": [
      {
        "k": "Rail width",
        "v": "244px expanded · 62px collapsed (transition 160ms ease)"
      },
      {
        "k": "Rail surface",
        "v": "#FFF · 1px right #E4E8EF · sticky top 0 · h 100vh"
      },
      {
        "k": "Brand block",
        "v": "pad 16px 16px 13px · 1px bottom #EEF1F6 · gap 10px"
      },
      {
        "k": "Logo tile",
        "v": "30×30px · radius 9px · --logo-tile #14532D · --logo-tile-on #D9F2C4 10.5px / 700"
      },
      {
        "k": "Group header",
        "v": "pad 14px 8px 7px · 10.5px / 700 / 0.1em · #5A6577"
      },
      {
        "k": "Nav item",
        "v": "pad 8px 10px · radius 9px · gap 10px · 13.5px / 400 #4B5565"
      },
      {
        "k": "Nav active",
        "v": "linear-gradient(180deg,#177236,#125A2B) · #FFF / 700 = 6.01:1 at the lightest stop"
      },
      {
        "k": "Nav hover",
        "v": "#F4F6FA bg · #1E2532 text"
      },
      {
        "k": "Item mark",
        "v": "13px · 1.8px #B3BDCD — square PTC, circle LTO, diamond config · decorative, 1.4.11 exempt beside its label"
      },
      {
        "k": "Icon-only control",
        "v": "collapse chevron and account ⋯ use #667085 (4.83:1) with an aria-label + title — never the #98A2B3 caret grey, which is decorative only"
      },
      {
        "k": "Collapsed item",
        "v": "34px tile · title + aria-label required (the label is the only name once text drops)"
      },
      {
        "k": "Nav badge",
        "v": "min-w 20px h 20px · radius 10px · #FEE2E2 / #B42318 11px / 700"
      },
      {
        "k": "Badge on active",
        "v": "rgba(255,255,255,.25) bg · #FFF text"
      },
      {
        "k": "Collapsed badge",
        "v": "7px dot #E5484D · 2px #FFF ring · top/right 5px"
      },
      {
        "k": "Rail footer",
        "v": "pad 12px 14px · #FBFCFE · 1px top #EEF1F6"
      },
      {
        "k": "Header",
        "v": "pad 12px 32px · rgba(255,255,255,.75) · blur 6px · sticky z 6"
      },
      {
        "k": "Breadcrumb",
        "v": "13px / 500 #667085 · separator / #CBD3E0 · current #1E2532"
      },
      {
        "k": "Avatar",
        "v": "34px circle · #DBE4F0 · 2px #FFF · ring 1px #E4E8EF"
      }
    ]
  },
  {
    "name": "Tables",
    "summary": "header 11px 20px · row 13px 20px · expand panel #FAFBFD",
    "rows": [
      {
        "k": "Column header",
        "v": "pad 11px 20px · #FAFBFD · 10.5px / 700 / 0.08em #5A6577"
      },
      {
        "k": "Header rule",
        "v": "1px bottom #EEF1F6"
      },
      {
        "k": "Row",
        "v": "pad 13px 20px · 1px bottom #F5F7FA · grid gap 14px"
      },
      {
        "k": "Row hover",
        "v": "#FAFBFD · cursor pointer when expandable"
      },
      {
        "k": "Row title",
        "v": "14px / 700 / -0.005em · ellipsis single line"
      },
      {
        "k": "Row sub",
        "v": "12px / 400 #667085 · 3px above"
      },
      {
        "k": "Numeric cell",
        "v": "mono 12.5px / 400 · #15803D for LTO numbers"
      },
      {
        "k": "Caret cell",
        "v": "44px wide · 13px ▸/▾ · #98A2B3 (decorative) · right aligned"
      },
      {
        "k": "Expanded panel",
        "v": "#FAFBFD · pad 16px 20px 20px · auto-fit minmax(260px,1fr) gap 22px"
      },
      {
        "k": "Panel label",
        "v": "10.5px / 700 / 0.08em #5A6577 · 8px below"
      },
      {
        "k": "Grid template",
        "v": "44px · minmax(240px,2.4fr) · 148px · 132px · 116px · 136px · 44px · gap 14px · min-width 1040px"
      },
      {
        "k": "Select column",
        "v": "44px centred · 17px checkbox · header is aria-checked=mixed when partial"
      },
      {
        "k": "Identity cell",
        "v": "13.5px/700 #1E2532 + 12px #667085 sub · both clip with ellipsis, never wrap"
      },
      {
        "k": "Mono cell",
        "v": "12px JetBrains Mono #15803D for live codes · #C3CAD6 em-dash when absent"
      },
      {
        "k": "Numeric cell",
        "v": "12.5px mono / 700 right-aligned + 10.5px #98A2B3 unit + 3px meter (track #EEF1F6, fill = the tone) 5px below"
      },
      {
        "k": "State stripe",
        "v": "3px absolute left, full row height · green #177236 · amber #D9A13B · red #E5484D · closed #EEF1F6 · never the only status cue"
      },
      {
        "k": "Row padding",
        "v": "12px 20px default · 8px 20px compact · header 10px 20px"
      },
      {
        "k": "Saved views",
        "v": "pills 5px 11px · active #14532D / #D9F2C4 · idle 1px #DDE2EA · + is 26px dashed #CBD3E0"
      },
      {
        "k": "Bulk bar",
        "v": "8px 20px · #F7FCF9 · 1px bottom #E4F1E8 · 12.5px #15803D with a select-all link"
      },
      {
        "k": "Rows-per-page",
        "v": "30px · 1px #D5DBE6 · radius 8px · sits left of pagination in the footer"
      },
      {
        "k": "Actions cell",
        "v": "44px centred · 26px ⋯ hit area, aria-label + title required"
      },
      {
        "k": "Sort caret",
        "v": "8px · active #177236 · idle #B3BDCD · header cell is the button"
      },
      {
        "k": "Selected row",
        "v": "#F7FCF9 · bulk bar #E8F6EC with 1px #D3EBDB under the toolbar"
      },
      {
        "k": "Toolbar",
        "v": "pad 12px 20px · 34px search and segmented · density toggle right"
      },
      {
        "k": "Empty cell",
        "v": "em-dash #C3CAD6 in the cell's own alignment — never blank, never N/A"
      },
      {
        "k": "Expand indent",
        "v": "panel content starts at 78px (select 44 + gap 14 + 20 pad)"
      },
      {
        "k": "Min table width",
        "v": "1040–1180px inside overflow-x:auto"
      },
      {
        "k": "Footer bar",
        "v": "pad 13px 20px · #FAFBFD · 12.5px #667085"
      },
      {
        "k": "Pagination",
        "v": "34×32px · radius 8px · active #177236/#FFF · idle 1px #D5DBE6"
      },
      {
        "k": "Result pill",
        "v": "pad 8px 12px · radius 999px · #E8F6EC / #15803D 12.5px / 700 (4.50:1)"
      }
    ]
  },
  {
    "name": "Stat cards & meters",
    "summary": "card 12px radius · dot 8px · meter 6px track",
    "rows": [
      {
        "k": "Grid",
        "v": "auto-fit minmax(190px,1fr) · gap 12px"
      },
      {
        "k": "Card",
        "v": "pad 14px 16px · radius 12px · #FFF · 1px #E4E8EF"
      },
      {
        "k": "Card selected",
        "v": "1px #25A94E + 0 0 0 3px rgba(37,169,78,.12)"
      },
      {
        "k": "Muted card",
        "v": "#FBFCFE bg · figure #5A6577 (data, so AA applies)"
      },
      {
        "k": "Label",
        "v": "12px / 500 #667085 · dot 8px · gap 7px"
      },
      {
        "k": "Figure",
        "v": "23px / 700 / -0.01em · 5px above"
      },
      {
        "k": "Hint",
        "v": "11.5px / 400 #667085 · urgent 700 #B42318"
      },
      {
        "k": "Stage number",
        "v": "19×19px · radius 6px · idle #EEF1F6/#5A6577 · active #177236/#FFF"
      },
      {
        "k": "Meter track",
        "v": "6px · radius 999px · #EEF1F6"
      },
      {
        "k": "Meter fill",
        "v": "linear-gradient(90deg,#25A94E,#7BC96F)"
      },
      {
        "k": "Meter caption",
        "v": "12px / 400 #667085 · value 700 #15803D · 7px above"
      },
      {
        "k": "Expiry pill",
        "v": "≤60d #FEE2E2/#B42318 · ≤180d #FEF2E0/#A16207 · else #EEF1F6/#667085"
      }
    ]
  },
  {
    "name": "Motion, states & z-index",
    "summary": "120–160ms · one focus ring · z 6/12/40",
    "rows": [
      {
        "k": "Hover / fill",
        "v": "transition background 120ms"
      },
      {
        "k": "Border change",
        "v": "transition border-color 120ms"
      },
      {
        "k": "Switch",
        "v": "transition background 140ms + justify-content 140ms"
      },
      {
        "k": "Rail collapse",
        "v": "transition width 160ms ease"
      },
      {
        "k": "Toast timer",
        "v": "@keyframes toastTimer scaleX 1→0, 5s linear forwards"
      },
      {
        "k": "Spinner",
        "v": "@keyframes spin 700ms linear infinite"
      },
      {
        "k": "Focus ring",
        "v": "0 0 0 3px rgba(37,169,78,.15) + border #25A94E — every focusable"
      },
      {
        "k": "Disabled",
        "v": "surface #F7F9FC · border #E4E8EF · text #B9C1D1 (--ink-200, the only disabled text value) · cursor not-allowed"
      },
      {
        "k": "Empty value",
        "v": "em dash — in #C3CAD6 (decorative, has a text equivalent in the header)"
      },
      {
        "k": "Sticky header",
        "v": "z-index 6"
      },
      {
        "k": "Dropdown / menu",
        "v": "z-index 12 · top 44px (40px for 34px triggers)"
      },
      {
        "k": "Dialog + scrim",
        "v": "z-index 40 · position fixed inset 0"
      },
      {
        "k": "Reduced motion",
        "v": "drop timer + spinner animations, keep state colours"
      }
    ]
  },
  {
    "name": "Keyboard & focus",
    "summary": "every control reachable · one visible ring · Esc always closes",
    "rows": [
      {
        "k": "Focus ring",
        "v": ":focus-visible → border #25A94E + 0 0 0 3px rgba(37,169,78,.15)"
      },
      {
        "k": "Never",
        "v": "outline:none without replacing the ring"
      },
      {
        "k": "Tab order",
        "v": "DOM order = visual order; no positive tabindex anywhere"
      },
      {
        "k": "Chips (filter)",
        "v": "role=button tabindex=0 · Space/Enter toggles"
      },
      {
        "k": "Chips (dismiss)",
        "v": "× is a real <button> with aria-label='Remove {filter}'"
      },
      {
        "k": "Underline tabs",
        "v": "←/→ moves and selects · Home/End jumps · only active tab tabbable"
      },
      {
        "k": "Segmented",
        "v": "radiogroup semantics · ←/→ changes selection"
      },
      {
        "k": "Stage cards",
        "v": "tabbable buttons · Enter/Space selects · ←/→ optional"
      },
      {
        "k": "Dropdown open",
        "v": "Enter/Space/↓ opens and focuses first option"
      },
      {
        "k": "Dropdown nav",
        "v": "↑/↓ moves · Enter picks · Esc closes and returns focus to trigger"
      },
      {
        "k": "Multi-select",
        "v": "Space toggles without closing · Tab reaches Clear/Apply"
      },
      {
        "k": "Typeahead",
        "v": "typing in an open panel filters, does not jump-select"
      },
      {
        "k": "Row menu",
        "v": "Esc closes · click-outside closes · focus returns to ⋯"
      },
      {
        "k": "Dialog",
        "v": "focus moves to dialog on open, traps inside, returns to trigger on close"
      },
      {
        "k": "Dialog keys",
        "v": "Esc = cancel · Enter on focused button only (never auto-confirm)"
      },
      {
        "k": "Toast focus",
        "v": "never steals focus · action reachable by Tab while visible"
      },
      {
        "k": "Toast timing",
        "v": "pause auto-dismiss on hover/focus-within; resume on leave"
      },
      {
        "k": "Table rows",
        "v": "expandable row = button with aria-expanded; caret is decorative"
      },
      {
        "k": "Bulk select",
        "v": "header checkbox is aria-checked=mixed when partial"
      },
      {
        "k": "Skip link",
        "v": "first tab stop jumps past the rail to <main>"
      }
    ]
  },
  {
    "name": "ARIA & semantics",
    "summary": "native elements first · aria only where markup can't say it",
    "rows": [
      {
        "k": "Buttons",
        "v": "<button type=button> — never a div with onClick"
      },
      {
        "k": "Fields",
        "v": "<label for> or aria-label; hint via aria-describedby"
      },
      {
        "k": "Error state",
        "v": "aria-invalid=true + aria-describedby pointing at the error text"
      },
      {
        "k": "Required",
        "v": "required attr; asterisk optional, never the only signal"
      },
      {
        "k": "Tabs",
        "v": "role=tablist / tab / tabpanel · aria-selected · aria-controls"
      },
      {
        "k": "Segmented",
        "v": "role=radiogroup with role=radio children + aria-checked"
      },
      {
        "k": "Dropdown",
        "v": "role=combobox aria-expanded aria-haspopup=listbox + role=listbox/option"
      },
      {
        "k": "Multi-select",
        "v": "aria-multiselectable=true · aria-selected per option"
      },
      {
        "k": "Row menu",
        "v": "aria-haspopup=menu · role=menu / menuitem"
      },
      {
        "k": "Dialog",
        "v": "role=dialog aria-modal=true aria-labelledby + aria-describedby"
      },
      {
        "k": "Toast region",
        "v": "aria-live=polite (assertive for error) · role=status · aria-atomic=true"
      },
      {
        "k": "Inline notice",
        "v": "role=status; error notice role=alert"
      },
      {
        "k": "Switch",
        "v": "role=switch aria-checked — not a checkbox"
      },
      {
        "k": "Chips as status",
        "v": "plain text, no role; the word carries the meaning, colour never alone"
      },
      {
        "k": "Counts",
        "v": "badge text needs context: aria-label='10 applications for checking'"
      },
      {
        "k": "Progress",
        "v": "role=progressbar aria-valuenow/min/max on upload + expiry meters"
      },
      {
        "k": "Skeletons",
        "v": "aria-hidden=true inside an aria-busy=true container"
      },
      {
        "k": "Icon-only",
        "v": "aria-label required (⋯ = 'Row actions', × = 'Dismiss')"
      },
      {
        "k": "Nav",
        "v": "<nav aria-label='Primary'> · active item aria-current=page"
      },
      {
        "k": "Tables",
        "v": "real <table> with <th scope=col>; grid CSS is fine, faked headers are not"
      }
    ]
  },
  {
    "name": "Responsive & touch",
    "summary": "single rail breakpoint · tables scroll · 44px on touch",
    "rows": [
      {
        "k": "≥1280px",
        "v": "full layout · content max-w 1280px (tables 1560px)"
      },
      {
        "k": "1024–1279px",
        "v": "stat grids reflow via auto-fit minmax(190px,1fr)"
      },
      {
        "k": "<1024px",
        "v": "rail collapses to 62px; two-column detail becomes one"
      },
      {
        "k": "<768px",
        "v": "rail off-canvas behind a 44px toggle; header stays sticky"
      },
      {
        "k": "Tables",
        "v": "never reflow — overflow-x:auto with min-width 1020–1180px"
      },
      {
        "k": "Table on mobile",
        "v": "row becomes a stacked card: title, chips, then key/value pairs"
      },
      {
        "k": "Filter bar",
        "v": "wraps: search 1 1 280px, segmented and sort drop to a second line"
      },
      {
        "k": "Toasts",
        "v": "width 372px desktop · calc(100% - 32px) below 420px"
      },
      {
        "k": "Dialog",
        "v": "max-w 428px · full-width minus 24px scrim padding on mobile"
      },
      {
        "k": "Touch targets",
        "v": "44×44px minimum — 34px controls get padding, not a smaller box"
      },
      {
        "k": "Checkbox / radio",
        "v": "17px box inside a 44px tappable row on touch"
      },
      {
        "k": "Hover styles",
        "v": "guard with @media (hover:hover) so touch doesn't stick them"
      },
      {
        "k": "Reduced motion",
        "v": "@media (prefers-reduced-motion:reduce) → animation/transition none; toast timer becomes a static bar"
      },
      {
        "k": "Zoom",
        "v": "layout holds to 200% zoom; no fixed heights on text containers"
      },
      {
        "k": "Dark on white",
        "v": "#1E2532 15.37:1 · #344054 10.46:1 · #475467 7.69:1 · #667085 4.97:1 — all pass"
      },
      {
        "k": "Column headers",
        "v": "#5A6577 = 5.89:1 on #FFF (10.5px is normal text — the large-text exemption needs ≥18.66px bold)"
      },
      {
        "k": "On tinted surfaces",
        "v": "canvas #EEF1F6 costs ~0.6 — #667085 drops to 4.39:1 and FAILS there; use #5A6577 (5.21:1) for page subtitles, breadcrumbs, footers, and text on #EEF1F6 tiles"
      },
      {
        "k": "Hints & meta",
        "v": "#667085 inside white cards only — 12px meta is still normal text"
      },
      {
        "k": "Muted figures",
        "v": "25px/700 muted stat = #5A6577; #98A2B3 is 2.51:1 on #FBFCFE and misses even the 3:1 large-text bar"
      },
      {
        "k": "Placeholder",
        "v": "#667085 — placeholder is in scope for 1.4.3"
      },
      {
        "k": "Decorative greys",
        "v": "#8A94A6 3.06:1 · #98A2B3 2.58:1 · #C3CAD6 1.66:1 — icons, carets, dots, em-dashes only; never readable text"
      },
      {
        "k": "Disabled",
        "v": "#B9C1D1 1.81:1 — allowed, 1.4.3 exempts disabled controls"
      },
      {
        "k": "White on green",
        "v": "only on #177236 (6.01:1) or darker — #1D8F42 is 4.15:1, #17A34A 3.29:1, #25A94E 3.06:1 and all fail with white text"
      },
      {
        "k": "Tone text on tint",
        "v": "#8A5206/#FEF2E0 5.77 · #B42318/#FEE2E2 5.38 · #175CD3/#EAF2FE 5.31 · #5A6577/#EEF1F6 5.21 · #15803D/#E8F6EC 4.50 — passes with zero headroom, so never lighten either side"
      },
      {
        "k": "Colour alone",
        "v": "never the only signal — every tone pairs with a word (Approved, Legacy, Returned)"
      },
      {
        "k": "Focus ring",
        "v": "#25A94E on #FFF = 3.06:1 · #2FB25F on #161C26 = 6.23:1 — both meet 1.4.11"
      },
      {
        "k": "1.4.11 exception",
        "v": "resting control BORDERS do not reach 3:1 in either theme — light #C3CAD6/#FFF 1.65, #D5DBE6/#FFF 1.39; dark #55606F/#161C26 2.68, #384556 1.75. Known, deliberate: state is carried by the filled/focused state (both ≥ 3:1) and by an always-visible label, never by the resting border alone"
      }
    ]
  },
  {
    "name": "Dark mode",
    "summary": "data-theme=\"dark\" · same geometry · dark text on the green fill",
    "rows": [
      {
        "k": "Canvas",
        "v": "#0F141C",
        "c": "#0F141C"
      },
      {
        "k": "Card",
        "v": "#161C26 · 1px #2A3441 · shadow none"
      },
      {
        "k": "Sunken strip",
        "v": "#1C242F — header, footer, expanded row"
      },
      {
        "k": "Field well",
        "v": "#10161F · 1px #384556"
      },
      {
        "k": "Control shell",
        "v": "#222B38 · segmented active #2A3441"
      },
      {
        "k": "Muted card",
        "v": "#141A23 · row hover #1A212B"
      },
      {
        "k": "Divider",
        "v": "1px #222B38 (card border #2A3441)"
      },
      {
        "k": "Text",
        "v": "#E8ECF3 14.43:1 · #C3CCDA 10.56:1 · #9AA5B5 6.86:1 — all on #161C26"
      },
      {
        "k": "Decorative",
        "v": "#6F7B8C 3.98:1 · disabled #55606F 2.36:1 (exempt)"
      },
      {
        "k": "Green fill",
        "v": "#2FB25F with #0B1017 text = 6.95:1 (white would be 2.74:1) — read --green-on-fill"
      },
      {
        "k": "Green hover",
        "v": "#3FC26E",
        "c": "#3FC26E"
      },
      {
        "k": "Green text",
        "v": "#6FDC96 = 10.06:1 — links, active tab, mono numbers"
      },
      {
        "k": "Focus ring",
        "v": "1px #2FB25F + 0 0 0 3px rgba(47,178,95,.18)"
      },
      {
        "k": "Amber",
        "v": "text #F0C070 · tint rgba(217,161,59,.18)"
      },
      {
        "k": "Red",
        "v": "text #FF9B95 · tint rgba(229,72,77,.18)"
      },
      {
        "k": "Blue",
        "v": "text #8FB8FF · tint rgba(23,92,211,.24)"
      },
      {
        "k": "Violet",
        "v": "text #C4B2FF · tint rgba(140,110,240,.22)"
      },
      {
        "k": "Neutral tint",
        "v": "rgba(255,255,255,.07) with #C3CCDA text"
      },
      {
        "k": "Elevation",
        "v": "card/button none · toast 0 8px 24px rgba(0,0,0,.50) · panel .45 · dialog .60"
      },
      {
        "k": "Scrim",
        "v": "rgba(4,7,12,.62)"
      },
      {
        "k": "Selected surfaces",
        "v": "option row rgba(47,178,95,.12) · selected card #1C242F (light #F2FAF4 / #F7FCF9 have no place on dark)"
      },
      {
        "k": "Notice fills",
        "v": "green .14 · amber .14 · red .16 · blue .16 over the surface"
      },
      {
        "k": "Soft border",
        "v": "#384556 — service chips and inline filters (light #DDE2EA)"
      },
      {
        "k": "Destructive",
        "v": "outline border rgba(255,155,149,.45) · filled #FF9B95 with #2A0806 text"
      },
      {
        "k": "Dialog",
        "v": "#161C26 · 1px #2A3441 · shadow 0 24px 60px rgba(0,0,0,.60) · scrim rgba(4,7,12,.62)"
      },
      {
        "k": "Empty state",
        "v": "1px dashed #384556 · title #E8ECF3 · sub #9AA5B5 (1.6px dashed is the dropzone only)"
      },
      {
        "k": "Skeleton",
        "v": "11px bars #222B38 on #161C26 · 3 rows max"
      },
      {
        "k": "Pagination",
        "v": "active #2FB25F/#0B1017 · idle 1px #384556/#C3CCDA · disabled #6F7B8C"
      },
      {
        "k": "Rail",
        "v": "#161C26 · 1px right #2A3441 · brand rule + footer rule #222B38 · footer #1C242F"
      },
      {
        "k": "Logo tile",
        "v": "--logo-tile #2FB25F / --logo-tile-on #0B1017 — the #14532D/#D9F2C4 pair goes muddy on dark"
      },
      {
        "k": "Nav item",
        "v": "#C3CCDA · hover #222B38 with #E8ECF3 text"
      },
      {
        "k": "Nav active",
        "v": "linear-gradient(180deg,#2FB25F,#249A4F) with #0B1017 / 700 = 6.95:1"
      },
      {
        "k": "Item mark",
        "v": "13px · 1.8px #55606F (decorative, paired with a text label)"
      },
      {
        "k": "Nav badge",
        "v": "rgba(229,72,77,.18) / #FF9B95 · on active rgba(11,16,23,.28) / #0B1017"
      },
      {
        "k": "Collapsed dot",
        "v": "7px #E5484D · 2px #161C26 ring (light uses a 2px #FFF ring)"
      },
      {
        "k": "Group header",
        "v": "10.5px / 700 / 0.1em #9AA5B5"
      },
      {
        "k": "Header",
        "v": "rgba(22,28,38,.75) · blur 6px · 1px #2A3441 · pad 12px 32px"
      },
      {
        "k": "Breadcrumb",
        "v": "#9AA5B5 · separator #55606F · current #E8ECF3"
      },
      {
        "k": "Icon button",
        "v": "34px · #1C242F · 1px #2A3441 · #C3CCDA glyph"
      },
      {
        "k": "Avatar",
        "v": "34px #2A3441 with #C3CCDA initials · 2px #161C26 + 1px #2A3441 ring"
      },
      {
        "k": "Unchanged",
        "v": "every height, radius, padding, gap, weight and font — palette only"
      }
    ]
  },
  {
    "name": "Type & layout",
    "summary": "DM Sans 400/500/700 · JetBrains Mono for copyable values",
    "rows": [
      {
        "k": "Family",
        "v": "'DM Sans', system-ui, sans-serif"
      },
      {
        "k": "Mono",
        "v": "'JetBrains Mono', monospace"
      },
      {
        "k": "Page title",
        "v": "26px / 700 / -0.015em"
      },
      {
        "k": "Section title",
        "v": "17px / 700"
      },
      {
        "k": "Card figure",
        "v": "23px / 700 / -0.01em"
      },
      {
        "k": "Row title",
        "v": "14px / 700"
      },
      {
        "k": "Body",
        "v": "13.5px / 400 / 1.55 · #475467 (7.69:1)"
      },
      {
        "k": "Field label",
        "v": "12.5px / 500 · #344054"
      },
      {
        "k": "Meta",
        "v": "12px / 400 · #667085"
      },
      {
        "k": "Column header",
        "v": "10.5px / 700 / 0.08em uppercase · #5A6577"
      },
      {
        "k": "Page canvas",
        "v": "#EEF1F6",
        "c": "#EEF1F6"
      },
      {
        "k": "Card",
        "v": "#FFF · 1px #E4E8EF · radius 14px · shadow 0 1px 2px rgba(16,24,40,.04)"
      },
      {
        "k": "Section gutter",
        "v": "24px x · 22px between cards"
      },
      {
        "k": "Content max-w",
        "v": "1320px detail · 1560px tables · gutter 32px"
      },
      {
        "k": "Table row",
        "v": "pad 13px 20px · 1px #F5F7FA · hover #FAFBFD"
      }
    ]
  }
]
