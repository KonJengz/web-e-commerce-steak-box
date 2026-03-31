export const resolvePublicIdentifier = (
  preferred: string | null | undefined,
  fallback: string,
): string => {
  const normalizedPreferred =
    typeof preferred === "string" ? preferred.trim() : "";

  return normalizedPreferred.length > 0 ? normalizedPreferred : fallback;
};
