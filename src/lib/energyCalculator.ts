// Calculate daily energy value based on mood inputs and cat properties
export function calculateEnergyValue(
  bodyState: string,
  need: string,
  catEnergy: 'high' | 'medium' | 'low'
): number {
  // For low energy cats, return a value in the 15-30% range
  if (catEnergy === 'low') {
    // Base low energy at 22%
    let lowScore = 22;
    
    // Slight adjustments based on need
    switch (need) {
      case '休息':
        lowScore = 18; // Lower for rest
        break;
      case '被理解':
        lowScore = 22; // Neutral
        break;
      case '发泄':
        lowScore = 26; // Slightly higher for release
        break;
      case '自己待着':
        lowScore = 20; // Lower for alone time
        break;
      case '被陪着':
        lowScore = 25; // Slightly higher for companionship
        break;
    }
    
    return Math.max(15, Math.min(30, lowScore));
  }

  let score = 50; // Base score for medium/high energy

  // Body state scoring
  switch (bodyState) {
    case '身体不舒服':
      score += 30;
      break;
    case '心里堵':
      score += 40;
      break;
    case '都有':
      score += 20;
      break;
    case '说不上来':
      score += 50;
      break;
  }

  // Need adjustments
  switch (need) {
    case '休息':
      score -= 10;
      break;
    case '被理解':
      score += 0;
      break;
    case '发泄':
      score += 10;
      break;
    case '自己待着':
      score -= 10;
      break;
    case '被陪着':
      score += 5;
      break;
  }

  // Cat energy adjustments
  switch (catEnergy) {
    case 'high':
      score += 20;
      break;
    case 'medium':
      score += 0;
      break;
  }

  // Clamp between 40% and 95% for medium/high energy
  return Math.max(40, Math.min(95, score));
}

// Get background color based on trigger type
export function getBackgroundColor(triggerType: string): string {
  switch (triggerType) {
    case 'situation':
      return '#E8EEF4'; // 灰蓝
    case 'anxiety':
      return '#F5F0E8'; // 米黄
    case 'relationship':
      return '#F5E8F0'; // 浅粉紫
    case 'positive':
      return '#EFF5F0'; // 浅绿
    case 'general':
    case 'physical':
    case 'growth':
      return '#F5F5F3'; // 浅暖灰
    default:
      return '#F5F5F3'; // 浅暖灰
  }
}
