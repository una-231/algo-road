function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stableShuffle(items, seed) {
  return [...items]
    .map((item) => ({ item, score: hashString(`${seed}-${item.id}`) }))
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item);
}

function hasSharedTag(a, b) {
  const tags = new Set(a.tags || []);
  return (b.tags || []).some((tag) => tags.has(tag));
}

export function getRecommendedProblems(currentProblem, allProblems) {
  if (!currentProblem) return [];
  const base = allProblems.filter((problem) => problem.id !== currentProblem.id);
  const byOne = base.filter(
    (problem) =>
      hasSharedTag(currentProblem, problem) &&
      Math.abs(problem.difficulty - currentProblem.difficulty) <= 1,
  );
  const byTwo = base.filter(
    (problem) =>
      hasSharedTag(currentProblem, problem) &&
      Math.abs(problem.difficulty - currentProblem.difficulty) <= 2 &&
      !byOne.some((item) => item.id === problem.id),
  );
  const loose = base.filter(
    (problem) => !byOne.some((item) => item.id === problem.id) && !byTwo.some((item) => item.id === problem.id),
  );
  return stableShuffle([...byOne, ...byTwo, ...loose], currentProblem.id).slice(0, 5);
}
