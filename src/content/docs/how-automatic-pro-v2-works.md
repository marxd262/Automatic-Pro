---
title: How Automatic Pro v2 Works
description: A concise explanation of the phase logic behind Automatic Pro v2 and the core adaptation formulas.
---

## The four core phases in v2

Automatic Pro v2 is built around intelligent phase stops. Instead of using fixed times, it uses stop triggers to decide when to move on.

| Phase | Goal | Target logic |
| --- | --- | --- |
| Pre-Infusion | Fill headspace and wet the puck without building pressure | High flow, capped at low pressure |
| Bloom | Keep the puck saturated and avoid premature channeling | Low flow with a low pressure ceiling |
| Ramp-Up | Build pressure smoothly instead of spiking it | Same flow, higher pressure limit |
| Brewing | Hold the main extraction flow with a 9 bar limit | Main output phase |

## Default 18g reference

The reference example in the source material is:

- `18g` dose
- `36g` yield
- `1:2` ratio
- `91°C`
- `1.8g/s` brew flow

That combination is why the 18g file is the best baseline when you want to understand the rest of the system.

## Phase overview at a glance

| Phase | Flow | Pressure limit | Duration | Stop trigger |
| --- | --- | --- | --- | --- |
| 1. Pre-Infusion | `20 g/s` | `2 bar` | `10s` | `1g out` or about `31ml pumped` |
| 2. Bloom | `1.8 g/s` | `2 bar` | `1-10s` | `1.5g out` |
| 3. Ramp-Up | `1.8 g/s` | `12 bar` | `6s` | `11g out` |
| 4. Brewing | `1.8 g/s` | `9 bar` | `120s` max | `36g out` or manual stop |

## Why the profile behaves this way

### Pre-infusion

The goal is to fill headspace and saturate the puck without building pressure too early. The reference formula from the source material is:

`Dose x 1.3 + headspace`

That gives you a rough pumped-water target for the pre-infusion phase.

### Bloom

Bloom is not treated as a full pause. Automatic Pro keeps a light flow moving so the puck stays saturated while the pressure ceiling prevents it from turning into an aggressive extraction step.

### Ramp-up

Instead of using a sharp flow jump, v2 keeps the same flow and raises the pressure ceiling. This helps the profile build pressure more smoothly and reduces the risk of spikes.

### Brewing

The main brewing phase is flow-led. The recommended flow comes from an ideal extraction time rather than only from recipe size.

## How to adapt the profile

### Flow for phases 2, 3, and 4

Use brew yield and ideal brew time:

`Yield / Time = Flow`

Example for `18g` in and `36g` out over `20s` of brewing:

`36 / 20 = 1.8 g/s`

### Phase 1 pumped water

`Dose x 1.3 + Headspace`

This gives you a practical target for filling the puck and basket headspace before the later phases take over.

### Phase 3 stop weight

`Flow x Phase 3 duration`

At `1.8 g/s` for `6s`, the stop weight becomes about `11g`.

## A note on vIT3

The in-testing vIT3 branch expands this logic with more granular puck saturation and extraction checks. It is intentionally kept separate from the stable explanation so you always know which guidance belongs to the proven branch and which belongs to the experimental one.
