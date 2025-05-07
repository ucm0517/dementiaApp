// services/dialogueEvaluator.js

export function evaluateDialogueAnswer(index, answer) {
  const text = answer.trim().toLowerCase();
  console.log('📌 evaluateDialogueAnswer index:', index, '| answer:', answer, '| normalized:', text);
  switch (index) {
    case 0: // 어제 뭐 했는지 (행동)
      return /(했|갔|만나|먹|잠|놀|봤|일했|공부|산책|운동)/.test(text) ? 3 : 0;

    case 1: // 오늘 요일
      return /(월|화|수|목|금|토|일|오늘)/.test(text) ? 3 : 0;

    case 2: // 최근 기분
      return /(기분.?좋|기분.?나쁘|기분.?나빠|나빴|기쁘|좋아|좋았|행복|즐겁|슬퍼|우울|불안|화났|짜증|지쳤)/.test(text) ? 3 : 0;

    case 3: // 최근 만남과 대화
      return /(친구|가족|엄마|아빠|형|누나|언니|동생|대화|얘기|말|회의|통화|전화)/.test(text) ? 3 : 0;

    default:
      return 0;
  }
}

export function getFinalResultMessage(score) {
  if (score >= 25) return "인지 능력에 큰 문제는 없어 보입니다. 계속 건강을 유지하세요!";
  if (score >= 21) return "경계선 수준입니다. 필요 시 전문가 상담을 권장합니다.";
  if (score >= 18) return "경미한 인지 저하가 의심됩니다. 추후 검진을 권장합니다.";
  return "인지 능력의 심각한 저하가 의심됩니다. 빠른 병원 방문이 필요합니다.";
}
