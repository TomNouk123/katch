/**
 * K-pop Matching Algorithm
 * 
 * Maps western artists to K-pop groups based on genre/style similarities.
 * Each western artist has tags that correspond to K-pop group tags.
 * When a user swipes right on an artist, points are added to matching K-pop groups.
 */

// Genre/style tags that each western artist contributes to K-pop matching
export const artistTagMapping: Record<string, string[]> = {
  // Pop artists
  'sabrina': ['pop', 'dance', 'r&b'],
  'dualipa': ['pop', 'dance', 'funk'],
  'troyesivan': ['pop', 'synth-pop', 'dance'],
  'taylorswift': ['pop', 'folk-pop', 'indie-rock'],
  'edsheeran': ['pop', 'acoustic', 'folk-pop'],
  'bensonboone': ['pop', 'indie-rock', 'acoustic'],
  'tatemcrae': ['pop', 'dance', 'r&b'],
  'roxydekker': ['pop', 'dance', 'funk-pop'],
  
  // R&B / Soul
  'sza': ['r&b', 'jazz', 'pop'],
  'norahjones': ['jazz', 'r&b', 'acoustic'],
  'theweeknd': ['r&b', 'synth-pop', 'pop'],
  'kehlani': ['r&b', 'pop', 'dance'],
  'oliviadean': ['r&b', 'jazz', 'funk'],
  'drake': ['hip-hop', 'r&b', 'pop', 'trap'],
  
  // Indie / Alternative / Dream Pop
  'lanadelrey': ['indie-pop', 'pop', 'soft-rock'],
  'phoebe': ['indie-rock', 'folk-pop', 'alternative-rock'],
  'aurora': ['indie-pop', 'folk-pop', 'electronic'],
  'laufey': ['jazz', 'indie-pop', 'acoustic'],
  'arcticmonkeys': ['indie-rock', 'alternative-rock', 'rock'],
  'the1975': ['indie-rock', 'synth-pop', 'alternative-rock'],
  'tameimpala': ['indie-rock', 'synth-pop', 'electronic'],
  
  // Hyperpop / Electropop
  'charli': ['hyperpop', 'dance', 'electronic', 'synth-pop'],
  'ashnikko': ['hyperpop', 'hip-hop', 'electronic'],
  'grimes': ['hyperpop', 'electronic', 'synth-pop'],
  
  // Hip Hop / Rap / Trap
  'travisscott': ['hip-hop', 'trap', 'edm'],
  'denzelcurry': ['hip-hop', 'trap', 'old-school-hip-hop'],
  'kendricklamar': ['hip-hop', 'trap', 'jazz'],
  
  // Latin / World
  'rosalia': ['reggaeton', 'latin', 'pop', 'dancehall'],
  'jbalvin': ['reggaeton', 'trap', 'dancehall', 'latin'],
  'burnaboy': ['dancehall', 'reggaeton', 'latin'],
  
  // EDM / Electronic
  'martingarrix': ['edm', 'electronic', 'dance'],
  'diplo': ['edm', 'dancehall', 'electronic'],
  'avicii': ['edm', 'electronic', 'dance'],
  
  // Country / Folk / Americana
  'lukecombs': ['folk-pop', 'acoustic', 'pop'],
  'suzanfreek': ['folk-pop', 'acoustic', 'pop'],
  
  // Rock / Metal
  'maneskin': ['rock', 'alternative-rock', 'punk-rock'],
  'foofighters': ['rock', 'alternative-rock', 'punk-rock'],
  'bmth': ['alternative-metal', 'rock', 'edm'],
  'system': ['alternative-metal', 'rock'],
  'linkinpark': ['alternative-rock', 'alternative-metal', 'rock'],
  'greenday': ['punk-rock', 'alternative-rock', 'rock'],
  'slipknot': ['alternative-metal', 'rock'],
  'coldplay': ['alternative-rock', 'pop', 'indie-rock'],
  'beatles': ['rock', 'pop', 'pop-rock'],
  'gorillaz': ['alternative-rock', 'hip-hop', 'electronic'],
};

// How many points each tag gives to each K-pop group
// Based on spreadsheet: Genre 1 = 10 points, Genre 2 = 6 points, Genre 3 = 3 points
export const tagToGroupScores: Record<string, Record<string, number>> = {
  // Hyperpop / Electropop
  'hyperpop': { lesserafim: 3 },
  
  // Folk / Acoustic / Indie
  'folk-pop': { akmu: 10 },
  'indie-pop': { akmu: 6 },
  'acoustic': { akmu: 3, therose: 3 },
  
  // EDM / Electronic
  'edm': { ateez: 10, blackpink: 3, straykids: 3 },
  'techno': { ateez: 6 },
  'electronic': { nct127: 6 },
  'experimental': { nct127: 3 },
  
  // Pop
  'pop': { blackpink: 10, lesserafim: 10, twice: 10, kissoflife: 3, redvelvet: 3, xdinaryheroes: 3 },
  
  // Hip Hop / Rap
  'hip-hop': { bts: 10, ikon: 10, nct127: 10, straykids: 10, youngposse: 10, kissoflife: 6 },
  'old-school-hip-hop': { youngposse: 10 },
  'pop-rap': { ikon: 6 },
  
  // Rock
  'alternative-rock': { day6: 10, xdinaryheroes: 10 },
  'alternative-metal': { dreamcatcher: 10 },
  'rock': { dreamcatcher: 6, qwer: 6 },
  'indie-rock': { therose: 10, qwer: 3 },
  'soft-rock': { therose: 6 },
  'pop-rock': { day6: 3, xdinaryheroes: 6 },
  'punk-rock': { xdinaryheroes: 6 },
  
  // R&B / Soul
  'r&b': { kissoflife: 10, mamamoo: 10, redvelvet: 6 },
  'jazz': { mamamoo: 6 },
  'funk': { mamamoo: 3 },
  'folk': { redvelvet: 6 },
  
  // Trap
  'trap': { ateez: 3, blackpink: 6, straykids: 6, youngposse: 3 },
  
  // Dance / Synth
  'dance': { lesserafim: 6, twice: 6, redvelvet: 6 },
  'synth-pop': { twice: 3 },
  
  // Pop variations
  'pop-rock-alt': { qwer: 10 },
};

export interface MatchResult {
  groupId: string;
  score: number;
  percentage: number;
}

/**
 * Calculate K-pop group matches based on liked western artists
 */
export function calculateMatches(likedArtistIds: string[]): MatchResult[] {
  const scores: Record<string, number> = {
    twice: 0,
    blackpink: 0,
    straykids: 0,
    ateez: 0,
    mamamoo: 0,
    ikon: 0,
    day6: 0,
    dreamcatcher: 0,
    akmu: 0,
    bts: 0,
    lesserafim: 0,
    kissoflife: 0,
    nct127: 0,
    qwer: 0,
    redvelvet: 0,
    therose: 0,
    xdinaryheroes: 0,
    youngposse: 0,
  };

  // For each liked artist, add their tag scores to groups
  for (const artistId of likedArtistIds) {
    const tags = artistTagMapping[artistId];
    if (!tags) continue;

    for (const tag of tags) {
      const groupScores = tagToGroupScores[tag];
      if (!groupScores) continue;

      for (const [groupId, points] of Object.entries(groupScores)) {
        scores[groupId] += points;
      }
    }
  }

  // Convert to array and sort by score
  const results = Object.entries(scores)
    .map(([groupId, score]) => ({ groupId, score, percentage: 0 }))
    .sort((a, b) => b.score - a.score);

  // Calculate percentages based on top score
  const maxScore = results[0]?.score || 1;
  for (const result of results) {
    result.percentage = Math.round((result.score / maxScore) * 100);
  }

  return results;
}

/**
 * Get the top matched K-pop group
 */
export function getTopMatch(likedArtistIds: string[]): string | null {
  if (likedArtistIds.length === 0) return null;
  
  const matches = calculateMatches(likedArtistIds);
  return matches[0]?.groupId || null;
}

/**
 * Get top N matches
 */
export function getTopMatches(likedArtistIds: string[], count: number = 3): MatchResult[] {
  const matches = calculateMatches(likedArtistIds);
  return matches.slice(0, count);
}
