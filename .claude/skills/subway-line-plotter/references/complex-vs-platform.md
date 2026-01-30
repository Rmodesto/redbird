# Complex vs. Platform: NYC Subway Station Naming

## Definitions

- **Complex**: A physical underground/elevated structure that may span multiple blocks and house multiple platforms. Riders transfer between platforms within a complex via passageways, stairs, or elevators.
- **Platform**: A specific boarding area within a complex, serving a specific set of lines. Each platform has its own coordinates (lat/lng) and its own official MTA station name.
- **Station Name**: The MTA-assigned name for a platform. Different platforms within the same complex can have **different names**.

## Why This Matters for the Map

When plotting a line, you must use the **platform name** for that line's stop — not the complex name. The tooltip must show the **transfer lines available at that specific platform**, not every line in the complex.

## Key Examples

### World Trade Center / Chambers St / Cortlandt St / Park Place Complex

This is the most confusing complex in the system. Four different platform names for interconnected stations:

| Platform Name | Lines | Coordinates | Notes |
|---|---|---|---|
| **World Trade Center** | E | [-74.009781, 40.712582] | E train terminal only |
| **Chambers St** | A, C | [-74.009266, 40.713243] | A/C through-stop on 8th Ave |
| **Cortlandt St** | R, W | [-74.0095515, 40.712603] | Broadway BMT platform |
| **Park Place** | 2, 3 | [-74.008811, 40.713051] | 7th Ave IRT platform |
| **Chambers St** | 1 | [-74.009266, 40.715478] | 1 train separate platform |
| **Fulton St** | 4, 5, J, Z | [-74.007838, 40.710089] | Nearby but separate complex |

**Rules:**
- E line → use "World Trade Center"
- A/C line → use "Chambers St"
- R/W line → use "Cortlandt St"
- 2/3 line → use "Park Place"
- 1 line → use "Chambers St" (different platform from A/C)

### Times Square / Port Authority Complex

| Platform Name | Lines | Notes |
|---|---|---|
| **Times Sq-42 St** | 1, 2, 3, 7, N, Q, R, S, W | Broadway & 7th Ave platforms |
| **42 St/Port Authority Bus Terminal** | A, C, E | 8th Ave platform |

**Rules:**
- A/C/E line → use "42 St/Port Authority Bus Terminal"
- All other lines → use "Times Sq-42 St"

### 14th Street Complex

| Platform Name | Lines | Notes |
|---|---|---|
| **14 St** | 1, 2, 3 | 7th Ave IRT |
| **14 St** | A, C, E | 8th Ave IND |
| **14 St** | F, M | 6th Ave IND |
| **14 St-Union Sq** | 4, 5, 6, N, Q, R, W | Union Square |
| **8 Av** | L | Canarsie line |

Note: "14 St" appears for three different divisions but they share coordinates. "14 St-Union Sq" and "8 Av" are at different coordinates.

### Broadway-Lafayette / Bleecker St Complex

| Platform Name | Lines | Notes |
|---|---|---|
| **Broadway-Lafayette St** | B, D, F, M | 6th Ave / Houston St |
| **Bleecker St** | 6 | Lexington local |

Connected by transfer passage but different names and coordinates.

### Fulton St Complex (Manhattan)

| Platform Name | Lines | Notes |
|---|---|---|
| **Fulton St** | 2, 3, 4, 5, A, C, J, Z | Multiple platforms, one name |

Exception: All lines use the same name here despite multiple platforms.

### Canal St Complex

| Platform Name | Lines | Notes |
|---|---|---|
| **Canal St** | A, C, E | 8th Ave platform |
| **Canal St** | N, Q, R, W, J, Z, 6 | Broadway/Lafayette platforms |
| **Canal St** | 1 | 7th Ave platform |

Same name, three different platform locations. Use coordinates from `stations-normalized.json` filtered by line.

## Verification Checklist

When implementing a line, for each station:

1. Look up the official station name in `references/mta-line-maps.md` for that specific line
2. Find the matching entry in `stations-normalized.json` filtered by that line
3. Use that entry's coordinates
4. Set the `lines` array in the tooltip to only include lines that share **that specific platform**
5. Cross-reference with `references/station-identity.md` if the name appears at multiple locations
