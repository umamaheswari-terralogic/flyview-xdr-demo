// Shared sim state — two independent demo scenarios

export const simState = {
  // Scenario 1: Antivirus disabled — triggers Threats + Identity
  antivirusCompliant: true,

  // Scenario 2: Blocked app installed — triggers AI-SPM + Threats
  deviceCompliant:    true,
  deviceExtensions:   [],
}
