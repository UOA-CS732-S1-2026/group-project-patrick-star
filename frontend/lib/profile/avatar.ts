export function getStyleAvatarEmoji(stylePreferences?: string[]) {
  const firstStyle = stylePreferences?.[0];
  const emoji = firstStyle?.trim().split(/\s+/)[0];

  return emoji || "👤";
}
