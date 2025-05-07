export function evaluateAnswer(index, answer) {
  const text = answer.trim().toLowerCase();

  switch (index) {
    case 0: { // 오늘 날짜 (3점)
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      if (text.includes(`${month}`) && text.includes(`${day}`)) return 3;
      if (text.includes(`${month}`) || text.includes(`${day}`)) return 1;
      return 0;
    }

    case 1: { // 연산 문제 (3점)
      const num = parseInt(text.replace(/[^0-9]/g, ''));
      if (num === 79) return 3;
      if (Math.abs(num - 79) <= 2) return 1;
      return 0;
    }

    case 2: { // 기억력1 (4점)
      const correct = ['사과', '버스', '병원'];
      const hits = correct.filter(word => text.includes(word)).length;
      return hits === 3 ? 4 : hits === 2 ? 3 : hits === 1 ? 1 : 0;
    }

    case 3: { // 동물 이름 (4점)
      const animals = [
        '개', '고양이', '강아지', '토끼', '사자', '호랑이', '곰', '여우', '늑대', '말',
        '소', '돼지', '치타', '박쥐', '낙타', '코끼리', '기린', '하마', '두더지', '고릴라',
        '원숭이', '다람쥐', '사슴', '물개', '돌고래', '표범', '하이에나', '팬더', '수달', '앵무새',
        '공작', '까치', '참새', '오리', '닭', '칠면조', '매', '독수리', '비둘기', '기러기'
      ];
      const words = text.split(/[\s,\.]+/).filter(Boolean);
      const count = words.filter(w => animals.includes(w)).length;
      if (count >= 5) return 4;
      if (count >= 3) return 3;
      if (count >= 1) return 1;
      return 0;
    }

    case 4: { // 기억력2 (4점)
      const correct = ['사과', '버스', '병원'];
      const hits = correct.filter(word => text.includes(word)).length;
      return hits === 3 ? 4 : hits === 2 ? 3 : hits === 1 ? 1 : 0;
    }

    default:
      return 0;
  }
}
