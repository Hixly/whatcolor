/** Engine options derived from the user's settings. */
export function engineOptions(settings) {
  return {
    profile: settings.colorblindProfile,
    severity: settings.cvdStrength === 'mild' ? 0.6 : 1,
  }
}
