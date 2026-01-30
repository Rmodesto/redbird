# Station Identity: Same Name, Different Locations

NYC has 50+ station names that appear at multiple distinct physical locations. When building a line's station array, you MUST use the coordinates for the correct platform — never assume a name maps to one location.

## How to Resolve

1. Look up the station in `/data/stations-normalized.json`
2. Filter by the line you're implementing: `s.lines.includes('YOUR_LINE')`
3. Use that entry's `longitude` and `latitude`
4. Check the `platforms` array to confirm which lines share that physical platform
5. Cross-reference with `*_LINE_IMPLEMENTATION.md` for transfer accuracy

## Major Complexes (6+ name collisions)

### 86 St (6 locations)
| Lines | Borough | Coordinates |
|-------|---------|-------------|
| R | Brooklyn | [-74.028398, 40.622687] |
| N | Brooklyn | [-73.97823, 40.592721] |
| B,C | Manhattan | [-73.968916, 40.785868] |
| 1 | Manhattan | [-73.976218, 40.788644] |
| 4,5,6 | Manhattan | [-73.955589, 40.779492] |
| Q | Manhattan | [-73.951787, 40.777891] |

### 23 St (5 locations)
| Lines | Borough | Coordinates |
|-------|---------|-------------|
| R,W | Manhattan | [-73.989344, 40.741303] |
| C,E | Manhattan | [-73.998041, 40.745906] |
| F,M | Manhattan | [-73.992821, 40.742878] |
| 1 | Manhattan | [-73.995657, 40.744081] |
| 6 | Manhattan | [-73.986599, 40.739864] |

### 125 St (4 locations)
| Lines | Borough | Coordinates |
|-------|---------|-------------|
| A,B,C,D | Manhattan | [-73.952343, 40.811109] |
| 1 | Manhattan | [-73.958372, 40.815581] |
| 4,5,6 | Manhattan | [-73.937594, 40.804138] |
| 2,3 | Manhattan | [-73.945495, 40.807754] |

### 96 St (4 locations)
| Lines | Borough | Coordinates |
|-------|---------|-------------|
| B,C | Manhattan | [-73.964696, 40.791642] |
| 1,2,3 | Manhattan | [-73.972323, 40.793919] |
| 6 | Manhattan | [-73.95107, 40.785672] |
| Q | Manhattan | [-73.947152, 40.784318] |

## 3-Location Names

- **103 St**: B,C / 1 / 6
- **111 St**: J (Queens) / A (Queens) / 7 (Queens) — all in Queens but different locations
- **116 St**: B,C / 6 / 2,3
- **145 St**: A,B,C,D / 1 / 3
- **18 Av**: D / N / F (all Brooklyn, different routes)
- **28 St**: R,W / 1 / 6
- **50 St**: D (Brooklyn) / C,E (Manhattan) / 1 (Manhattan)
- **7 Av**: B,Q (Brooklyn) / F,G (Brooklyn) / B,D,E (Manhattan)
- **72 St**: B,C / 1,2,3 / Q
- **Avenue U**: Q / N / F (all Brooklyn)
- **Bay Pkwy**: D / N / F (all Brooklyn)
- **Canal St**: 6,J,N,Q,R,W,Z / A,C,E / 1
- **Church Av**: B,Q / F,G / 2,5
- **Fort Hamilton Pkwy**: D / N / F,G
- **Kings Hwy**: B,Q / N / F
- **Van Siclen Av**: J,Z / C / 3

## 2-Location Names

104 St, 135 St, 155 St, 167 St, 170 St, 181 St, 20 Av, 34 St-Penn Station (A,C,E vs 1,2,3), 36 St (Brooklyn D,N,R vs Queens M,R), 77 St (Brooklyn R vs Manhattan 6), 79 St (Brooklyn D vs Manhattan 1), 8 Av (Brooklyn N vs Manhattan A,C,E,L), Bergen St (F,G vs 2,3), Broadway (Queens N,W vs Brooklyn G), Chambers St (4,5,6,J,Z vs 1,2,3), Clinton-Washington Avs, DeKalb Av, Dyckman St, Flushing Av, Fordham Rd, Fulton St (Manhattan 2,3,4,5,A,C,J,Z vs Brooklyn G), Grand St, Gun Hill Rd, Halsey St, Kingsbridge Rd, Lorimer St, New Lots Av, Nostrand Av (A,C vs 3), Pelham Pkwy, Prospect Av (Brooklyn R vs Bronx 2,5), Rector St, Rockaway Av, Spring St (C,E vs 6), Wall St (2,3 vs 4,5), Woodhaven Blvd

## Key Takeaway

Never look up a station by name alone. Always filter by line first, then use that specific entry's coordinates and platform data.
