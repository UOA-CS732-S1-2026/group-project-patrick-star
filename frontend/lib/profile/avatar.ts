export function getStyleAvatarEmoji(stylePreferences?: string[]) {
  // Style labels start with an emoji, so the first token becomes a compact avatar.
  const firstStyle = stylePreferences?.[0];
  const emoji = firstStyle?.trim().split(/\s+/)[0];

  return emoji || "👤";
}
