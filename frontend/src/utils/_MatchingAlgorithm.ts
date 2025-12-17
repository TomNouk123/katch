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
  'sabrina': ['pop', 'dance', 'r&b', 'catchy', 'upbeat'],
  'dualipa': ['pop', 'dance', 'disco', 'retro', 'catchy'],
  'troyesivan': ['pop', 'synth-pop', 'dance', 'electropop'],
  'taylorswift': ['pop', 'catchy', 'emotional', 'anthemic', 'folk'],
  'edsheeran': ['pop', 'acoustic', 'folk', 'emotional', 'ballad'],
  'bensonboone': ['pop', 'indie', 'emotional', 'acoustic'],
  'tatemcrae': ['pop', 'dance', 'emotional', 'catchy'],
  'roxydekker': ['pop', 'dance', 'catchy', 'upbeat'],
  
  // R&B / Soul
  'sza': ['r&b', 'neo-soul', 'vocal', 'emotional'],
  'norahjones': ['jazz', 'soul', 'vocal', 'acoustic', 'ballad'],
  'theweeknd': ['r&b', 'synth-pop', 'dark', 'pop', 'emotional'],
  'kehlani': ['r&b', 'neo-soul', 'pop', 'vocal', 'emotional'],
  'oliviadean': ['r&b', 'soul', 'pop', 'vocal'],
  'drake': ['hip-hop', 'r&b', 'pop', 'trap', 'emotional'],
  
  // Indie / Alternative / Dream Pop
  'lanadelrey': ['indie', 'dream-pop', 'art-pop', 'emotional', 'ambient'],
  'phoebe': ['indie', 'folk', 'rock', 'emotional', 'alt-rock'],
  'aurora': ['art-pop', 'electropop', 'folk', 'indie', 'ambient'],
  'laufey': ['jazz', 'bossa-nova', 'indie', 'acoustic', 'vocal'],
  'arcticmonkeys': ['indie', 'alt-rock', 'rock', 'band'],
  'the1975': ['indie', 'synth-pop', 'alt-rock', 'pop'],
  'tameimpala': ['indie', 'synth-pop', 'art-pop', 'experimental'],
  
  // Hyperpop / Electropop
  'charli': ['hyperpop', 'electropop', 'dance', 'experimental', 'synth-pop'],
  'ashnikko': ['hyperpop', 'hip-hop', 'electropop', 'experimental'],
  'grimes': ['art-pop', 'electropop', 'experimental', 'synth-pop'],
  
  // Hip Hop / Rap / Trap
  'travisscott': ['hip-hop', 'trap', 'experimental', 'dark'],
  'denzelcurry': ['hip-hop', 'trap', 'hardcore', 'experimental'],
  'kendricklamar': ['hip-hop', 'trap', 'experimental', 'vocal'],
  
  // Latin / World
  'rosalia': ['reggaeton', 'experimental', 'pop', 'dancehall'],
  'jbalvin': ['reggaeton', 'trap', 'dancehall', 'party'],
  'burnaboy': ['afrobeats', 'dancehall', 'reggaeton', 'party'],
  
  // EDM / Electronic
  'martingarrix': ['edm', 'progressive', 'electropop', 'anthemic'],
  'diplo': ['edm', 'dancehall', 'tropical', 'experimental'],
  'avicii': ['edm', 'progressive', 'anthemic', 'emotional'],
  
  // Orchestral / Cinematic
  'hanszimmer': ['orchestral', 'epic', 'theatrical', 'anthemic'],
  'maxrichter': ['minimalist', 'ambient', 'acoustic', 'emotional'],
  
  // Country / Folk / Americana
  'lukecombs': ['folk', 'acoustic', 'emotional', 'ballad'],
  'suzanfreek': ['folk', 'acoustic', 'pop', 'emotional', 'ballad'],
  
  // Rock / Metal
  'maneskin': ['rock', 'alt-rock', 'glam', 'band'],
  'foofighters': ['rock', 'alt-rock', 'band', 'anthemic'],
  'bmth': ['metalcore', 'metal', 'nu-metal', 'edm', 'hardcore'],
  'system': ['nu-metal', 'metal', 'alt-rock', 'hardcore'],
  'linkinpark': ['nu-metal', 'alt-rock', 'rock', 'emotional', 'band'],
  'greenday': ['rock', 'alt-rock', 'band', 'anthemic'],
  'slipknot': ['metal', 'nu-metal', 'hardcore', 'dark'],
  'coldplay': ['alt-rock', 'pop', 'anthemic', 'emotional', 'band'],
  'beatles': ['rock', 'pop', 'band', 'catchy'],
  'gorillaz': ['alt-rock', 'hip-hop', 'electropop', 'experimental', 'band'],
};

// How many points each tag gives to each K-pop group
export const tagToGroupScores: Record<string, Record<string, number>> = {
  // Pop tags
  'pop': { twice: 10, blackpink: 8, aespa: 6, nmixx: 5, lesserafim: 8, bts: 7, redvelvet: 8, enhypen: 6, seventeen: 7, iu: 9, kissoflife: 6 },
  'dance': { twice: 8, blackpink: 9, aespa: 8, kard: 7, nmixx: 7, ateez: 6, lesserafim: 9, enhypen: 8, seventeen: 9, monstax: 8, nct127: 8, redvelvet: 7 },
  'catchy': { twice: 10, blackpink: 6, lesserafim: 7, qwer: 7, youngposse: 6 },
  'upbeat': { twice: 10, kard: 6, lesserafim: 5 },
  'bright': { twice: 10 },
  'disco': { twice: 8, mamamoo: 5 },
  'retro': { twice: 6, mamamoo: 8, kissoflife: 9, shinee: 6 },
  
  // R&B / Soul
  'r&b': { mamamoo: 10, ikon: 8, blackpink: 4, kissoflife: 10, bts: 6, redvelvet: 8, shinee: 7 },
  'neo-soul': { mamamoo: 10, kissoflife: 7 },
  'soul': { mamamoo: 10, kissoflife: 9 },
  'vocal': { mamamoo: 10, nmixx: 7, akmu: 6, iu: 9, kissoflife: 8, redvelvet: 7, seventeen: 6 },
  'ballad': { mamamoo: 7, akmu: 8, day6: 6, iu: 10, therose: 8, bts: 5 },
  
  // Hip Hop / Rap
  'hip-hop': { straykids: 10, ikon: 10, blackpink: 7, bts: 9, nct127: 8, seventeen: 6, youngposse: 10, monstax: 7 },
  'trap': { straykids: 9, ikon: 8, blackpink: 8, nct127: 7, monstax: 7, youngposse: 8 },
  'party': { ikon: 8, kard: 7, blackpink: 5, youngposse: 8 },
  
  // Indie / Alternative
  'indie': { akmu: 10, day6: 7, iu: 7, qwer: 6, therose: 6 },
  'folk': { akmu: 10, day6: 6, iu: 8 },
  'acoustic': { akmu: 10, day6: 5, mamamoo: 3, iu: 9, therose: 7 },
  'dream-pop': { akmu: 8 },
  'bossa-nova': { akmu: 8, mamamoo: 4 },
  
  // Electronic / Hyperpop
  'hyperpop': { aespa: 10, nmixx: 10 },
  'electropop': { aespa: 9, kard: 7, nmixx: 6, lesserafim: 6, redvelvet: 6, shinee: 7, nct127: 6 },
  'synth-pop': { aespa: 7, kard: 8, enhypen: 6, shinee: 8, nct127: 7 },
  'experimental': { aespa: 8, nmixx: 9, straykids: 8, nct127: 10, redvelvet: 7, shinee: 6 },
  'art-pop': { aespa: 7, nmixx: 8, akmu: 6 },
  
  // EDM
  'edm': { ateez: 9, kard: 10, aespa: 7, straykids: 6, blackpink: 5, dreamcatcher: 5, monstax: 9, nct127: 7 },
  'progressive': { ateez: 8, kard: 6 },
  'tropical': { kard: 10 },
  
  // World / Latin
  'dancehall': { kard: 10, blackpink: 4 },
  'reggaeton': { kard: 9, blackpink: 5 },
  'afrobeats': { kard: 8 },
  
  // Rock / Metal
  'rock': { day6: 10, dreamcatcher: 9, straykids: 5, qwer: 10, xdinaryheroes: 10, therose: 9 },
  'alt-rock': { day6: 10, dreamcatcher: 8, qwer: 8, xdinaryheroes: 8, therose: 7 },
  'band': { day6: 10, qwer: 10, xdinaryheroes: 10, therose: 10 },
  'metal': { dreamcatcher: 10 },
  'metalcore': { dreamcatcher: 10, straykids: 5 },
  'nu-metal': { dreamcatcher: 9, straykids: 7 },
  'hardcore': { dreamcatcher: 8, straykids: 8 },
  'glam': { dreamcatcher: 5 },
  'dark': { dreamcatcher: 7, straykids: 6, enhypen: 8 },
  
  // Orchestral / Theatrical
  'orchestral': { ateez: 10 },
  'epic': { ateez: 10 },
  'theatrical': { ateez: 10, enhypen: 7 },
  'anthemic': { ateez: 9, straykids: 5, bts: 8, seventeen: 7, xdinaryheroes: 6, monstax: 6 },
  
  // Ambient / Minimalist
  'ambient': { akmu: 8 },
  'minimalist': { akmu: 9 },
  'emotional': { day6: 8, akmu: 7, mamamoo: 6, bts: 9, iu: 10, therose: 9, seventeen: 6 },
  
  // Jazz
  'jazz': { mamamoo: 8, akmu: 7, iu: 6 },
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
    aespa: 0,
    nmixx: 0,
    straykids: 0,
    ateez: 0,
    mamamoo: 0,
    ikon: 0,
    kard: 0,
    day6: 0,
    dreamcatcher: 0,
    akmu: 0,
    bts: 0,
    enhypen: 0,
    lesserafim: 0,
    iu: 0,
    kissoflife: 0,
    monstax: 0,
    nct127: 0,
    qwer: 0,
    redvelvet: 0,
    seventeen: 0,
    shinee: 0,
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
