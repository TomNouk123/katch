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
  'edm': { ateez: 10, blackpink: 3, straykids: 3, enhypen: 3 },
  'techno': { ateez: 6 },
  'electronic': { nct127: 6 },
  'experimental': { nct127: 3 },
  
  // Pop
  'pop': { blackpink: 10, lesserafim: 10, twice: 10, enhypen: 10, kissoflife: 3, redvelvet: 3, xdinaryheroes: 3 },
  
  // Hip Hop / Rap
  'hip-hop': { bts: 10, nct127: 10, straykids: 10, youngposse: 10, kissoflife: 6 },
  'old-school-hip-hop': { youngposse: 10 },
  
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
  'dance': { lesserafim: 6, twice: 6, enhypen: 6, redvelvet: 6 },
  'synth-pop': { twice: 3 },
  
  // Pop variations
  'pop-rock-alt': { qwer: 10 },
};

export interface MatchResult {
  groupId: string;
  score: number;
  percentage: number;
}

// Define which K-pop groups belong to which primary genre categories
const groupGenreCategories: Record<string, string[]> = {
  // Jazz / R&B / Soul groups
  'mamamoo': ['jazz', 'r&b', 'funk'],
  'kissoflife': ['r&b', 'hip-hop'],
  'redvelvet': ['r&b', 'pop', 'dance'],
  
  // Rock / Indie groups
  'day6': ['rock', 'alternative-rock', 'indie-rock'],
  'therose': ['indie-rock', 'soft-rock', 'acoustic'],
  'dreamcatcher': ['rock', 'alternative-metal'],
  'xdinaryheroes': ['rock', 'alternative-rock', 'punk-rock'],
  'qwer': ['rock', 'indie-rock', 'pop-rock'],
  
  // Hip Hop groups
  'bts': ['hip-hop', 'pop'],
  'straykids': ['hip-hop', 'edm', 'trap'],
  'nct127': ['hip-hop', 'electronic'],
  'youngposse': ['hip-hop', 'old-school-hip-hop'],
  
  // Pop / Dance groups
  'twice': ['pop', 'dance'],
  'blackpink': ['pop', 'edm', 'trap'],
  'lesserafim': ['pop', 'dance'],
  'enhypen': ['pop', 'dance', 'edm'],
  
  // EDM / Electronic groups
  'ateez': ['edm', 'hip-hop', 'trap'],
  
  // Folk / Acoustic groups
  'akmu': ['folk-pop', 'indie-pop', 'acoustic'],
};

// Genre category groupings for detecting user preferences
const genreCategories: Record<string, string[]> = {
  'jazz-rnb': ['jazz', 'r&b', 'funk', 'neo-soul'],
  'rock': ['rock', 'alternative-rock', 'indie-rock', 'soft-rock', 'alternative-metal', 'punk-rock', 'pop-rock'],
  'hip-hop': ['hip-hop', 'trap', 'old-school-hip-hop'],
  'pop-dance': ['pop', 'dance', 'synth-pop'],
  'edm': ['edm', 'electronic', 'techno'],
  'folk-indie': ['folk-pop', 'indie-pop', 'acoustic', 'folk'],
};

// Which K-pop groups best represent each genre category
const categoryToGroups: Record<string, string[]> = {
  'jazz-rnb': ['mamamoo', 'kissoflife', 'redvelvet'],
  'rock': ['day6', 'therose', 'dreamcatcher', 'xdinaryheroes', 'qwer'],
  'hip-hop': ['bts', 'straykids', 'nct127', 'youngposse'],
  'pop-dance': ['twice', 'blackpink', 'lesserafim', 'enhypen', 'redvelvet'],
  'edm': ['ateez', 'straykids', 'blackpink'],
  'folk-indie': ['akmu', 'therose', 'day6'],
};

/**
 * Detect the user's dominant genre categories based on liked artists
 */
function detectDominantCategories(likedArtistIds: string[]): { category: string; count: number }[] {
  const categoryCounts: Record<string, number> = {
    'jazz-rnb': 0,
    'rock': 0,
    'hip-hop': 0,
    'pop-dance': 0,
    'edm': 0,
    'folk-indie': 0,
  };

  for (const artistId of likedArtistIds) {
    const tags = artistTagMapping[artistId];
    if (!tags) continue;

    for (const tag of tags) {
      for (const [category, categoryTags] of Object.entries(genreCategories)) {
        if (categoryTags.includes(tag)) {
          // Weight primary tags (first in list) more heavily
          const tagIndex = tags.indexOf(tag);
          const weight = tagIndex === 0 ? 3 : tagIndex === 1 ? 2 : 1;
          categoryCounts[category] += weight;
        }
      }
    }
  }

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
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
    enhypen: 0,
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
 * Get top N matches with genre diversity
 * Ensures that if user has a clear genre preference (jazz, rock, etc.),
 * at least 2 of the 3 results will be from that genre category
 */
export function getTopMatchesWithDiversity(likedArtistIds: string[], count: number = 3): MatchResult[] {
  const allMatches = calculateMatches(likedArtistIds);
  const dominantCategories = detectDominantCategories(likedArtistIds);
  
  // Check if there's a clear dominant non-pop category
  // (pop-dance is excluded because it's too common as a secondary genre)
  const nonPopCategories = dominantCategories.filter(c => c.category !== 'pop-dance');
  const topNonPopCategory = nonPopCategories[0];
  const secondCategory = dominantCategories[1];
  
  // If there's a strong preference for a specific genre (jazz, rock, hip-hop, etc.)
  // and it's significantly higher than pop-dance, ensure genre representation
  const popDanceCount = dominantCategories.find(c => c.category === 'pop-dance')?.count || 0;
  
  if (topNonPopCategory && topNonPopCategory.count >= popDanceCount * 0.7 && topNonPopCategory.count >= 4) {
    const preferredGroups = categoryToGroups[topNonPopCategory.category] || [];
    const selectedResults: MatchResult[] = [];
    const usedGroupIds = new Set<string>();
    
    // First, get the top match overall (regardless of category)
    if (allMatches.length > 0) {
      selectedResults.push(allMatches[0]);
      usedGroupIds.add(allMatches[0].groupId);
    }
    
    // Then, ensure at least one more match from the preferred genre category
    // Find the highest scoring group from the preferred category that isn't already selected
    for (const match of allMatches) {
      if (selectedResults.length >= 2) break;
      if (usedGroupIds.has(match.groupId)) continue;
      
      if (preferredGroups.includes(match.groupId)) {
        selectedResults.push(match);
        usedGroupIds.add(match.groupId);
      }
    }
    
    // If we still need more from preferred category and first pick wasn't from it
    if (selectedResults.length < 2 || !preferredGroups.includes(selectedResults[0].groupId)) {
      for (const match of allMatches) {
        if (selectedResults.length >= 2) break;
        if (usedGroupIds.has(match.groupId)) continue;
        
        if (preferredGroups.includes(match.groupId)) {
          selectedResults.push(match);
          usedGroupIds.add(match.groupId);
        }
      }
    }
    
    // Fill remaining slots with next highest scoring groups
    for (const match of allMatches) {
      if (selectedResults.length >= count) break;
      if (usedGroupIds.has(match.groupId)) continue;
      
      selectedResults.push(match);
      usedGroupIds.add(match.groupId);
    }
    
    // Recalculate percentages based on the selected results
    const maxScore = selectedResults[0]?.score || 1;
    for (const result of selectedResults) {
      result.percentage = Math.round((result.score / maxScore) * 100);
    }
    
    return selectedResults.slice(0, count);
  }
  
  // No strong genre preference, just return top matches
  return allMatches.slice(0, count);
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
 * Get top N matches (uses diversity-aware algorithm)
 */
export function getTopMatches(likedArtistIds: string[], count: number = 3): MatchResult[] {
  return getTopMatchesWithDiversity(likedArtistIds, count);
}
