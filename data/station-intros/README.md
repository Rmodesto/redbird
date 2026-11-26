# Station editorial intros

Drop a hand-written intro for any station here as `<slug>.md`. When a file
exists, its text renders at the top of the station page's "About the station"
section, **above** the auto-generated description. No file = no override; the
generated text stands on its own.

## Format

- File name is the station **slug** (the last path segment of its URL), e.g.
  `times-sq-42-st.md` for `/station/times-sq-42-st`.
- Plain prose. Separate paragraphs with a blank line. Each blank-line-delimited
  block becomes one `<p>`. Inline Markdown (bold, links) is **not** rendered —
  write plain sentences.
- Keep it factual and specific to the station. This is your editorial voice;
  the rest of the page is generated from `data/stations-normalized.json`.

## The 30 most-connected stations

These are ranked by the number of services that call at the complex (the same
ranking the homepage uses). Good candidates to write first:

```
 1. times-sq-42-st            —  Times Sq-42 St (Manhattan, 12 services)
 2. atlantic-av-barclays-ctr  —  Atlantic Av-Barclays Ctr (Brooklyn, 9 services)
 3. 14-st-union-sq            —  14 St-Union Sq (Manhattan, 8 services)
 4. 34-st-herald-sq           —  34 St-Herald Sq (Manhattan, 8 services)
 5. fulton-st-2345acjz        —  Fulton St (Manhattan, 8 services)
 6. canal-st-6jnqrwz          —  Canal St (Manhattan, 7 services)
 7. cortlandt-st              —  Cortlandt St (Manhattan, 7 services)
 8. w-4-st-wash-sq            —  W 4 St-Wash Sq (Manhattan, 7 services)
 9. 6-av                      —  6 Av (Manhattan, 6 services)
10. lexington-av59-st         —  Lexington Av/59 St (Manhattan, 6 services)
11. 42-st-bryant-pk           —  42 St-Bryant Pk (Manhattan, 5 services)
12. 59-st-columbus-circle     —  59 St-Columbus Circle (Manhattan, 5 services)
13. botanic-garden            —  Botanic Garden (Brooklyn, 5 services)
14. broadway-junction         —  Broadway Junction (Brooklyn, 5 services)
15. broadway-lafayette-st     —  Broadway-Lafayette St (Manhattan, 5 services)
16. chambers-st-456jz         —  Chambers St (Manhattan, 5 services)
17. court-st                  —  Court St (Brooklyn, 5 services)
18. grand-central-42-st       —  Grand Central-42 St (Manhattan, 5 services)
19. jackson-hts-roosevelt-av  —  Jackson Hts-Roosevelt Av (Queens, 5 services)
20. 125-st-abcd               —  125 St (Manhattan, 4 services)
21. 145-st-abcd               —  145 St (Manhattan, 4 services)
22. 47-50-sts-rockefeller-ctr —  47-50 Sts-Rockefeller Ctr (Manhattan, 4 services)
23. 57-st-7-av                —  57 St-7 Av (Manhattan, 4 services)
24. 8-av-acel                 —  8 Av (Manhattan, 4 services)
25. coney-island-stillwell-av —  Coney Island-Stillwell Av (Brooklyn, 4 services)
26. court-sq-23-st            —  Court Sq-23 St (Queens, 4 services)
27. delancey-st-essex-st      —  Delancey St-Essex St (Manhattan, 4 services)
28. forest-hills-71-av        —  Forest Hills-71 Av (Queens, 4 services)
29. jay-st-metrotech          —  Jay St-MetroTech (Brooklyn, 4 services)
30. nevins-st                 —  Nevins St (Brooklyn, 4 services)
```
